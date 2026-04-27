import os
import re
from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from flask_cors import CORS
from dotenv import load_dotenv
from email_validator import validate_email, EmailNotValidError

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
# Enable CORS for the frontend domains
# For deployment, restrict the origins to your frontend domain like: CORS(app, origins=["https://yourdomain.com"])
CORS(app)

# Flask-Mail configuration
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 465))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'False').lower() in ['true', 'on', '1']
app.config['MAIL_USE_SSL'] = os.environ.get('MAIL_USE_SSL', 'True').lower() in ['true', 'on', '1']
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

mail = Mail(app)

RECIPIENT_EMAIL = os.environ.get('RECIPIENT_EMAIL')

def is_valid_email(email):
    """
    Validate email syntax and check if the domain has a valid MX record.
    Note: This requires the 'email-validator' package.
    """
    try:
        # Check that the email address is valid.
        # check_deliverability=True will perform an MX record lookup.
        validation = validate_email(email, check_deliverability=True)
        return True, validation.email
    except EmailNotValidError as e:
        return False, str(e)

@app.route('/api/contact', methods=['POST'])
def contact():
    # Parse JSON payload
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request or missing JSON payload"}), 400

    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    message = data.get('message', '').strip()

    # Input Validation
    if not name or not email or not message:
        return jsonify({"error": "All fields (name, email, message) are required"}), 400

    if len(name) < 2:
        return jsonify({"error": "Name must be at least 2 characters long"}), 400

    # Perform Deep Email Validation
    is_valid, validated_email_or_error = is_valid_email(email)
    if not is_valid:
        return jsonify({"error": f"Invalid email: {validated_email_or_error}"}), 400
    
    email = validated_email_or_error # Use the normalized email

    if len(message) < 10:
        return jsonify({"error": "Message must be at least 10 characters long"}), 400

    # Ensure email configuration is present
    if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD'] or not RECIPIENT_EMAIL:
        app.logger.error("Email configuration is missing.")
        return jsonify({"error": "Server configuration error. Contact administrator."}), 500

    try:
        # Construct email message
        msg = Message(
            subject=f"New Contact Form Submission from {name}",
            recipients=[RECIPIENT_EMAIL],
            sender=(name, email), # Use (Name, Email) tuple for better display
            reply_to=email,
            body=f"You have received a new message from your portfolio contact form.\n\n"
                 f"Name: {name}\n"
                 f"Email: {email}\n"
                 f"Message:\n{message}"
        )
        mail.send(msg)
        return jsonify({"success": "Message sent successfully"}), 200
    except Exception as e:
        app.logger.error(f"Error sending email: {e}")
        return jsonify({"error": "Failed to send message. Please try again later."}), 500

# Health check route
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

# Triggering reload for configuration changes
if __name__ == '__main__':
    # Run the Flask app
    app.run(host='0.0.0.0', port=5000, debug=True)
