# User Registration Endpoint Documentation

## Endpoint

**POST** `/users/register`

---

## Description

Registers a new user in the system.  
Validates the request body for required fields and correct formats.  
On success, returns a JWT token and the created user object.

---

## Request

### Headers

- `Content-Type: application/json`

### Body

```json
{
  "fullname": {
    "firstname": "John",      // Required, min 3 characters
    "lastname": "Doe"         // Optional, min 3 characters if provided
  },
  "email": "john.doe@example.com", // Required, must be a valid email
  "password": "secret123"          // Required, min 6 characters
}
```

---

## Responses

### Success

- **Status Code:** `201 Created`
- **Body:**
  ```json
  {
    "token": "<jwt_token>",
    "user": {
      "_id": "user_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com"
      // ...other user fields
    }
  }
  ```

### Validation Error

- **Status Code:** `400 Bad Request`
- **Body:**
  ```json
  {
    "errors": [
      {
        "msg": "Validation error message",
        "param": "field_name",
        "location": "body"
      }
      // ...other errors
    ]
  }
  ```

---

## Notes

- `firstname`, `email`, and `password` are required.
- `lastname` is optional but must be at least 3 characters if provided.
- Passwords are hashed before storage.
- Returns a JWT token for authentication.

---


# User Login Endpoint Documentation



## Endpoint

**POST** `/users/login`

---

## Description

Authenticates a user with email and password.  
Returns a JWT token and the user object on successful authentication.

---

## Request

### Headers

- `Content-Type: application/json`

### Body

```json
{
  "email": "john.doe@example.com", // Required, must be a valid email
  "password": "secret123"          // Required, min 6 characters
}
```

---

## Responses

### Success

- **Status Code:** `200 OK`
- **Body:**
  ```json
  {
    "token": "<jwt_token>",
    "user": {
      "_id": "user_id",
      "fullname": {
        "firstname": "John",
        "lastname": "Doe"
      },
      "email": "john.doe@example.com"
      // ...other user fields
    }
  }
  ```

### Validation Error

- **Status Code:** `400 Bad Request`
- **Body:**
  ```json
  {
    "errors": [
      {
        "msg": "Validation error message",
        "param": "field_name",
        "location": "body"
      }
      // ...other errors
    ]
  }
  ```

### Authentication Error

- **Status Code:** `401 Unauthorized`
- **Body:**
  ```json
  {
    "message": "Invalid email or password"
  }
  ```

---

## Notes

- Both `email` and `password` are required.
- Returns a JWT token for authentication.

### Get User Profile

- **Endpoint:** `GET /user/profile`
- **Description:** Retrieves the profile information of the currently authenticated user.
- **Headers:**
  - `Authorization`: Bearer token for authentication.
- **Success Response:**
  - **Status:** 200 OK
  - **Body:**
    - `id` (String): User's unique ID.
    - `name` (String): User's full name.
    - `email` (String): User's email address.
    - `avatar` (String, optional): URL to the user's avatar image.
- **Error Responses:**
  - **Status:** 401 Unauthorized
    - **Description:** Authentication token is missing or invalid.

---

### Logout User

- **Endpoint:** `POST /users/logout`
- **Description:** Logs out the currently authenticated user by invalidating their session or token.
- **Headers:**
  - `Authorization`: Bearer token for authentication.
- **Success Response:**
  - **Status:** 200 OK
  - **Body:**
    - `message` (String): Confirmation message indicating successful logout.
- **Error Responses:**
  - **Status:** 401 Unauthorized
    - **Description:** Authentication token is missing or invalid.
