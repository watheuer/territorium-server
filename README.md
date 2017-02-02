# Territorium Users server

This server handles creating/deleting users and authentication for Territorium.

## Users

### POST /users
```
Required parameters: username, password, email

Response:
{
  "data": {
    "user": {
      "id": 1,
      "email": "test@email.com",
      "username": "test_username"
    }
  }
}

Error:
{
  "message": "..."
}

```

### DELETE /users
```
Required parameters: token

Response: 204

Error:
{
  "message": "..."
}
```


## Auth

### POST /auth/login
```
Required parameters: username, password

Response:
{
  "data": {
    "token": "..."
  }
}
```

### POST /auth/logout
```
Required parameters: token

Response: 204

Error:
{
  "message": "..."
}
```
