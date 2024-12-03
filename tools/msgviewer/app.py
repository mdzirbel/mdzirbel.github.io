import os
from flask import Flask, request, render_template, send_file
from werkzeug.utils import secure_filename
import extract_msg
import zipfile
from io import BytesIO

app = Flask(__name__)

# Configure upload and output folders
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_EXTENSIONS = {'msg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER

# Ensure the upload and output directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_files():
    if request.method == 'POST':
        # Check if files are present in the request
        if 'files' not in request.files:
            return "No files part in the request"

        files = request.files.getlist('files')
        all_contents = ''

        # Clear previous outputs
        for f in os.listdir(app.config['OUTPUT_FOLDER']):
            os.remove(os.path.join(app.config['OUTPUT_FOLDER'], f))

        for file in files:
            if file and allowed_file(file.filename):
                # Secure the filename and save the file
                filename = secure_filename(file.filename)
                msg_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(msg_path)

                # Extract content from .msg file
                try:
                    msg = extract_msg.Message(msg_path)
                    content = msg.body or ''
                    msg.close()

                    # Save individual .txt file
                    txt_filename = os.path.splitext(filename)[0] + '.txt'
                    txt_path = os.path.join(app.config['OUTPUT_FOLDER'], txt_filename)
                    with open(txt_path, 'w', encoding='utf-8') as txt_file:
                        txt_file.write(content)

                    # Append content for the combined file
                    all_contents += content + '\n\n'
                except Exception as e:
                    print(f"Failed to process {filename}: {e}")

        # Save combined .txt file
        combined_path = os.path.join(app.config['OUTPUT_FOLDER'], 'combined.txt')
        with open(combined_path, 'w', encoding='utf-8') as combined_file:
            combined_file.write(all_contents)

        # Create a ZIP file of all .txt files
        zip_buffer = BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for txt_file in os.listdir(app.config['OUTPUT_FOLDER']):
                file_path = os.path.join(app.config['OUTPUT_FOLDER'], txt_file)
                zip_file.write(file_path, arcname=txt_file)
        zip_buffer.seek(0)

        # Send the ZIP file as a downloadable response
        return send_file(
            zip_buffer,
            mimetype='application/zip',
            as_attachment=True,
            download_name='extracted_texts.zip'
        )

    # Render the upload form on GET request
    return render_template('upload.html')

if __name__ == '__main__':
    app.run(debug=True)
