import json
from flask import Flask, request
from flask_cors import CORS
from http import HTTPStatus

from openia.http_client import create_chat_completion, get_models, build_message

app = Flask(__name__)
CORS(app)


def create_success_response(message):
    return {'response': {'message': message}}


def create_error_response(message, **kwargs):
    return {'error': {'message': message, **kwargs}}


@app.post('/validate_credentials/')
def validate_credentials():
    api_key = request.headers.get('Authorization')
    if api_key is None:
        return create_error_response('Field "Authorization" was expected but it was not found in the request headers'), HTTPStatus.BAD_REQUEST.value
    models = get_models(api_key)
    if not models.ok:
        error_message = models.json().get('error', {}).get('message', 'The error could not be identified')
        return create_error_response(error_message), models.status_code
    return create_success_response('The API key providad is valid'), HTTPStatus.OK.value


@app.post('/analyze_document/')
def analyze_document():
    api_key = request.headers.get('Authorization')
    if 'document' not in request.files:
        return create_error_response('Field "document" was expected but it was not found in the request body'), HTTPStatus.BAD_REQUEST.value
    document = request.files['document']
    document_content = document.stream.read().decode('utf-8')
    response = create_chat_completion(api_key, [
        build_message('Interpret the following CSV and provide an extended summary, then a list of 10 suggestions for further analysis'),
        build_message(document_content)
    ])
    return response.json()
