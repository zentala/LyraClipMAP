from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from pathlib import Path

# Create directories if they don't exist
Path("db").mkdir(exist_ok=True)
Path("app/static").mkdir(parents=True, exist_ok=True)
Path("app/templates").mkdir(exist_ok=True)

# Create Flask app
app = Flask(__name__)

# Configure database
import os
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(os.path.dirname(basedir), 'db', 'lyrics_finder.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

from app import routes
