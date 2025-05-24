import csv
import os
from PIL import Image
import re

# Get the absolute path of the directory where the script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

def get_dominant_color(image_path, num_clusters=3):
    """
    Calculates the dominant color of an image using k-means clustering.
    Resizes image for faster processing.
    """
    try:
        img = Image.open(image_path)
        img = img.convert("RGB")  # Ensure image is in RGB

        # Resize for speed, preserving aspect ratio
        img.thumbnail((100, 100)) 
        
        pixels = list(img.getdata())
        
        # If image is very small or has few unique colors, k-means might fail or be slow
        # For simplicity, we'll take the most common color after quantization
        # A more robust approach would use k-means clustering
        
        # Quantize the image to a reduced palette
        quantized_img = img.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
        palette = quantized_img.getpalette()
        color_counts = quantized_img.getcolors()

        if not color_counts:
            return None # Should not happen with MEDIANCUT if image is valid

        # Find the most frequent color
        most_frequent_color_index = max(color_counts, key=lambda item: item[0])[1]
        
        # Get the RGB tuple from the palette
        r = palette[most_frequent_color_index * 3]
        g = palette[most_frequent_color_index * 3 + 1]
        b = palette[most_frequent_color_index * 3 + 2]
        
        return f"#{r:02x}{g:02x}{b:02x}"
        
    except FileNotFoundError:
        print(f"Image not found: {image_path}")
        return None
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return None

def sanitize_champion_name(name):
    """Sanitizes champion name to match the image filename format."""
    if not name:
        return ""
    # Remove anything that's not a letter or number, then lowercase
    return re.sub(r'[^a-zA-Z0-9]', '', name).lower()

def main():
    # Construct paths relative to the script's location
    input_csv_path = os.path.join(SCRIPT_DIR, "champions.csv")
    output_csv_path = os.path.join(SCRIPT_DIR, "champions_with_colors.csv")
    image_folder_path = os.path.join(SCRIPT_DIR, "img_champions/")
    default_color = "#303050" # Default if image processing fails or image not found

    # Ensure the output directory exists (it should, as it's the same as input)
    # os.makedirs(os.path.dirname(output_csv_path), exist_ok=True) # This is SCRIPT_DIR, so it exists

    updated_rows = []
    header = []

    try:
        with open(input_csv_path, mode='r', newline='', encoding='utf-8') as infile:
            reader = csv.DictReader(infile)
            header = reader.fieldnames
            if 'DominantColor' not in header:
                header.append('DominantColor')
            
            for i, row in enumerate(reader):
                champion_name = row.get("Name")
                if not champion_name:
                    print(f"Row {i+2}: Champion name is missing. Skipping.")
                    row['DominantColor'] = default_color
                    updated_rows.append(row)
                    continue

                sanitized_name = sanitize_champion_name(champion_name)
                image_filename = f"{sanitized_name}.png"
                image_path = os.path.join(image_folder_path, image_filename)
                
                print(f"Processing {champion_name} (image: {image_filename})...")
                
                dominant_color_hex = get_dominant_color(image_path)
                
                if dominant_color_hex:
                    row['DominantColor'] = dominant_color_hex
                else:
                    print(f"Could not determine dominant color for {champion_name}. Using default.")
                    row['DominantColor'] = default_color
                
                updated_rows.append(row)

    except FileNotFoundError:
        print(f"Error: Input CSV file not found at {input_csv_path}")
        return
    except Exception as e:
        print(f"An error occurred while reading the CSV: {e}")
        return

    if not updated_rows:
        print("No data processed. Output CSV will not be created.")
        return

    try:
        with open(output_csv_path, mode='w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=header)
            writer.writeheader()
            writer.writerows(updated_rows)
        print(f"Successfully created {output_csv_path} with dominant colors.")
    except Exception as e:
        print(f"An error occurred while writing the output CSV: {e}")

if __name__ == "__main__":
    main() 