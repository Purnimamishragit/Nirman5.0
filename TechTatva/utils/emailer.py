import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class Emailer:
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    SMTP_USERNAME = 'your-email@gmail.com'
    SMTP_PASSWORD = 'your-app-password'
    FROM_EMAIL = 'your-email@gmail.com'
    
    @staticmethod
    def send_notification(to_email, hospital_name, resource_type, available_count):
        if 'your-email' in Emailer.SMTP_USERNAME:
            print(f"⚠️ Email not configured. Would send to {to_email}")
            return False
        
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'🏥 Resource Available at {hospital_name}'
            msg['From'] = Emailer.FROM_EMAIL
            msg['To'] = to_email
            
            html = f"""
            <html>
              <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #2c5aa0;">Hospital Resource Alert</h2>
                <p>Good news! The resource you requested is now available:</p>
                <div style="background: #f0f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Hospital:</strong> {hospital_name}</p>
                  <p><strong>Resource:</strong> {resource_type.replace('_', ' ').title()}</p>
                  <p><strong>Available:</strong> {available_count}</p>
                </div>
                <p>Please contact the hospital directly for more information.</p>
              </body>
            </html>
            """
            
            msg.attach(MIMEText(html, 'html'))
            
            server = smtplib.SMTP(Emailer.SMTP_SERVER, Emailer.SMTP_PORT)
            server.starttls()
            server.login(Emailer.SMTP_USERNAME, Emailer.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
            
            print(f"✅ Email sent to {to_email}")
            return True
            
        except Exception as e:
            print(f"❌ Email error: {e}")
            return False