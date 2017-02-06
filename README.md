# Territorium Users server

This server handles creating/deleting users and authentication for Territorium.

# Authorization

Routes that require authentication use the Authentication header:

`Bearer <token>`

This token is a standard JWT token that is retreived by logging in at `/auth/login`.

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

### GET /users/:id
```
Required headers: Authorization

Response:
{
  "data": {
    "user": {
      "id": 1,
      "email": "test@email.com",
      "username": "username"
    }
  }
}

Error:
{
  "message": "user does not exist."
}
```

### DELETE /users
```
Required header: Authorization

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
Required header: Authorization

Response: 204

Error:
{
  "message": "..."
}
```
