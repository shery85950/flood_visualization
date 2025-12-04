#!/usr/bin/env python3
"""
IRSA River Data Scraper
Scrapes daily river data from pakirsa.gov.pk and saves to JSON for the web app.
"""

import requests
import pdfplumber
from bs4 import BeautifulSoup
from datetime import datetime
import os
import json
from urllib.parse import urljoin
import re
import sys


class IRSARiverScraper:
    def __init__(self, output_dir="public/data"):
        self.base_url = "http://pakirsa.gov.pk"
        self.data_url = "http://pakirsa.gov.pk/DailyData.aspx"
        self.output_dir = output_dir
        self.temp_dir = "temp_pdfs"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

        # Create directories if they don't exist
        for directory in [output_dir, self.temp_dir]:
            if not os.path.exists(directory):
                os.makedirs(directory)

    def scrape_pdf_links(self):
        """Scrape the IRSA website for PDF download links"""
        print("Scraping IRSA website...")
        try:
            response = self.session.get(self.data_url, timeout=30)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Error fetching website: {e}")
            return []

        soup = BeautifulSoup(response.content, 'html.parser')
        pdf_links = []

        for link in soup.find_all('a'):
            href = link.get('href')
            if href and 'pdf' in href.lower():
                full_url = urljoin(self.base_url, href)
                text = link.get_text(strip=True)
                pdf_links.append({
                    'url': full_url,
                    'name': text or href.split('/')[-1],
                    'href': href
                })

        print(f"Found {len(pdf_links)} PDF(s)")
        return pdf_links

    def download_pdfs(self, pdf_links):
        """Download PDFs from IRSA"""
        downloaded_files = []

        for i, pdf in enumerate(pdf_links, 1):
            try:
                print(f"[{i}/{len(pdf_links)}] Downloading: {pdf['name']}")
                response = self.session.get(pdf['url'], timeout=30)
                response.raise_for_status()

                # Sanitize filename
                safe_name = re.sub(r'[^\w\-_\. ]', '_', pdf['name'])
                if not safe_name.lower().endswith('.pdf'):
                    safe_name += '.pdf'
                
                filename = os.path.join(self.temp_dir, safe_name)
                with open(filename, 'wb') as f:
                    f.write(response.content)
                downloaded_files.append(filename)
                print(f"    Saved")
            except requests.RequestException as e:
                print(f"    Error: {e}")

        return downloaded_files

    def extract_river_features(self, pdf_path):
        """Extract key river features from IRSA PDF"""
        features = {
            'file': os.path.basename(pdf_path),
            'date': None,
            'stations': {},
            'rim_inflows': None,
            'rim_outflows': None,
            'irsa_releases': {}
        }

        try:
            with pdfplumber.open(pdf_path) as pdf:
                print(f"Processing: {os.path.basename(pdf_path)}")

                page = pdf.pages[0]
                text = page.extract_text()

                if not text:
                    print("  No text extracted")
                    return features

                # Extract date
                date_match = re.search(r'(\d{2}\.\d{2}\.\d{4})', text)
                if date_match:
                    features['date'] = date_match.group(1)

                # Define key stations
                stations_to_extract = {
                    'INDUS @ TARBELA': ['LEVEL', 'DEAD LEVEL', 'MEAN INFLOW', 'MEAN OUTFLOW'],
                    'KALABAGH': ['U/S DISCHARGE', 'D/S DISCHARGE'],
                    'TAUNSA': ['U/S DISCHARGE', 'D/S DISCHARGE', 'T-P Link'],
                    'SUKKUR': ['U/S DISCHARGE', 'D/S DISCHARGE'],
                    'JHELUM @ MANGLA': ['LEVEL', 'DEAD LEVEL', 'MEAN INFLOW', 'MEAN OUTFLOW'],
                    'KABUL @ NOWSHERA': ['MEAN DISCHARGE'],
                    'CHASMA': ['LEVEL', 'DEAD LEVEL', 'MEAN INFLOW', 'MEAN OUTFLOW'],
                    'GUDDU': ['U/S DISCHARGE', 'D/S DISCHARGE'],
                    'KOIRI': ['U/S DISCHARGE', 'D/S DISCHARGE'],
                    'CHENAB @ MARALA': ['MEAN U/S DISCHARGE', 'MEAN D/S DISCHARGE'],
                    'PANJNAD': ['U/S DISCHARGE', 'D/S DISCHARGE']
                }

                for station_name in stations_to_extract.keys():
                    features['stations'][station_name] = {}
                    for metric in stations_to_extract[station_name]:
                        pattern = rf'{re.escape(metric)}\s*=\s*(\d+\.?\d*)'
                        matches = re.finditer(pattern, text, re.IGNORECASE)
                        for match in matches:
                            features['stations'][station_name][metric] = float(match.group(1))

                # Also try table extraction for more structured data
                tables = page.extract_tables()
                for table in tables:
                    self._parse_table_data(table, features)

                # Extract RIM Station data
                rim_inflow_match = re.search(r'\*?\*?RIM STATION INFLOWS\s*TOTAL\s*=?\s*(\d+)', text, re.IGNORECASE)
                if rim_inflow_match:
                    features['rim_inflows'] = int(rim_inflow_match.group(1))

                rim_outflow_match = re.search(r'RIM STATION OUTFLOWS\s*TOTAL\s*=?\s*(\d+)', text, re.IGNORECASE)
                if rim_outflow_match:
                    features['rim_outflows'] = int(rim_outflow_match.group(1))

                # Extract IRSA Releases
                irsa_section = re.search(
                    r'IRSA RELEASES\s*Date\s*Today\s*Last Year\s*(\d{2}\.\d{2}\.\d{4})\s*(\d{2}\.\d{2}\.\d{4})'
                    r'[\s\S]*?Punjab:\s*(\d+)\s*Cs\s*(\d+)\s*Cs'
                    r'[\s\S]*?Sindh:\s*(\d+)\s*Cs\s*(\d+)\s*Cs'
                    r'[\s\S]*?KP:\s*(\d+)\s*Cs\s*(\d+)\s*Cs'
                    r'[\s\S]*?Balochistan:\s*(\d+)\s*Cs\s*(\d+)\s*Cs',
                    text
                )

                if irsa_section:
                    features['irsa_releases'] = {
                        'punjab_today': int(irsa_section.group(3)),
                        'punjab_last_year': int(irsa_section.group(4)),
                        'sindh_today': int(irsa_section.group(5)),
                        'sindh_last_year': int(irsa_section.group(6)),
                        'kp_today': int(irsa_section.group(7)),
                        'kp_last_year': int(irsa_section.group(8)),
                        'balochistan_today': int(irsa_section.group(9)),
                        'balochistan_last_year': int(irsa_section.group(10))
                    }

                station_count = len([s for s in features['stations'].values() if s])
                print(f"  Extracted data for {station_count} stations")

        except Exception as e:
            print(f"  Error: {e}")

        return features

    def _parse_table_data(self, table, features):
        """Parse tabular data from PDF tables"""
        if not table:
            return
        
        for row in table:
            if not row:
                continue
            
            # Clean row data
            row = [str(cell).strip() if cell else '' for cell in row]
            
            # Look for numeric values associated with key terms
            row_text = ' '.join(row)
            
            # Try to extract values from structured table rows
            for i, cell in enumerate(row):
                if not cell:
                    continue
                    
                # Look for metric = value patterns
                match = re.search(r'(\d+\.?\d*)', cell)
                if match and i > 0:
                    try:
                        value = float(match.group(1))
                        # Associate with previous cell as label if it looks like a label
                        if row[i-1] and not re.match(r'^\d', row[i-1]):
                            label = row[i-1].upper()
                            if 'TARBELA' in label or 'INDUS' in label:
                                features['stations'].setdefault('INDUS @ TARBELA', {})[label] = value
                    except (ValueError, IndexError):
                        pass

    def process_all(self):
        """Run the complete pipeline"""
        print("\n" + "="*60)
        print("IRSA River Data Scraper")
        print("="*60)

        # Step 1: Scrape PDF links
        pdf_links = self.scrape_pdf_links()

        if not pdf_links:
            print("No PDFs found")
            return None

        # Step 2: Download PDFs
        pdf_files = self.download_pdfs(pdf_links)

        if not pdf_files:
            print("No PDFs downloaded")
            return None

        # Step 3: Extract river features
        print("\nExtracting river features...")
        all_results = []
        for pdf_path in pdf_files:
            features = self.extract_river_features(pdf_path)
            all_results.append(features)

        # Step 4: Save results
        output_file = os.path.join(self.output_dir, 'irsa_river_data.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_results, f, indent=2, ensure_ascii=False)

        print(f"\nData saved to {output_file}")

        # Display summary
        self.display_summary(all_results)

        # Cleanup temp PDFs
        self.cleanup()

        return all_results

    def cleanup(self):
        """Remove temporary PDF files"""
        import shutil
        if os.path.exists(self.temp_dir):
            shutil.rmtree(self.temp_dir)
            print("Cleaned up temporary files")

    def display_summary(self, results):
        """Display extracted data summary"""
        if not results:
            return

        latest = results[0]
        print("\n" + "="*60)
        print(f"LATEST REPORT - Date: {latest['date']}")
        print("="*60)

        print("\nKEY RIVER STATIONS:")
        for station, data in latest['stations'].items():
            if data:
                print(f"\n  {station}:")
                for metric, value in data.items():
                    print(f"    - {metric}: {value}")

        if latest['rim_inflows']:
            print(f"\nRIM STATION INFLOWS: {latest['rim_inflows']} Cs")
        if latest['rim_outflows']:
            print(f"RIM STATION OUTFLOWS: {latest['rim_outflows']} Cs")

        if latest['irsa_releases']:
            print("\nIRSA RELEASES (Today vs Last Year):")
            releases = latest['irsa_releases']
            for province in ['punjab', 'sindh', 'kp', 'balochistan']:
                today = releases.get(f'{province}_today', 'N/A')
                last_year = releases.get(f'{province}_last_year', 'N/A')
                print(f"  - {province.title()}: {today} Cs (was {last_year} Cs)")


def main():
    """Main entry point for the scraper"""
    # Determine output directory - use public/data for web app
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_dir = os.path.join(project_root, 'public', 'data')
    
    scraper = IRSARiverScraper(output_dir=output_dir)
    results = scraper.process_all()
    
    if results:
        print(f"\nSuccessfully processed {len(results)} PDF(s)")
        return 0
    else:
        print("\nNo data extracted")
        return 1


if __name__ == "__main__":
    sys.exit(main())
