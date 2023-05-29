import pytest

from app import create_success_response, create_error_response


def test_create_success_response():
    got = create_success_response('testing')
    assert got == {'response': {'message': 'testing'}}


def test_create_error_response():
    got = create_error_response('testing', hello='world')
    assert got == {'error': {'message': 'testing', 'hello': 'world'}}
