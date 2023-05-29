import requests


def generate_authentication_header(api_key):
    return {
        'Authorization': f'Bearer {api_key}',
    }


def create_completion(api_key, prompt, model='text-davinci-003', **kwargs):
    url = 'https://api.openai.com/v1/completions'
    body = {
        'model': model,
        'prompt': prompt,
        **kwargs,
    }
    headers = generate_authentication_header(api_key)
    return requests.post(url, json=body, headers=headers)


def build_message(content, role='user'):
    return {'role': role, 'content': content}


def create_chat_completion(api_key, messages, model='gpt-3.5-turbo', **kwargs):
    url = 'https://api.openai.com/v1/chat/completions'
    body = {
        'model': model,
        'messages': messages,
        **kwargs,
    }
    headers = generate_authentication_header(api_key)
    return requests.post(url, json=body, headers=headers)


def get_models(api_key):
    url = 'https://api.openai.com/v1/models'
    headers = generate_authentication_header(api_key)
    return requests.get(url, headers=headers)
