# 🧪 Guía de Testing - API Calculadora IMC

## 📋 Endpoints Disponibles

### Base URL
```
https://tu-app-name.onrender.com
```
> ⚠️ **Reemplaza `tu-app-name` con el nombre real de tu aplicación en Render**

---

## 🔓 Endpoints Públicos (Sin autenticación)

### 1. Registro de Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456",
  "name": "Usuario de Prueba"
}
```

**Respuesta esperada (201):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 2,
    "email": "test@example.com",
    "name": "Usuario de Prueba",
    "created_at": "2025-09-15T10:30:00.000Z",
    "updated_at": "2025-09-15T10:30:00.000Z"
  }
}
```

### 2. Login de Usuario
```http
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

**Respuesta esperada (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "test@example.com",
    "name": "Usuario de Prueba"
  }
}
```

> 🔑 **¡IMPORTANTE!** Guarda el `access_token` para usarlo en los siguientes requests

---

## 🔒 Endpoints Protegidos (Requieren JWT Token)

### 3. Perfil del Usuario
```http
GET /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta esperada (200):**
```json
{
  "id": 2,
  "email": "test@example.com",
  "name": "Usuario de Prueba",
  "created_at": "2025-09-15T10:30:00.000Z",
  "updated_at": "2025-09-15T10:30:00.000Z"
}
```

### 4. Calcular IMC
```http
POST /imc/calcular
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "peso": 70,
  "altura": 1.75,
  "edad": 25
}
```

**Respuesta esperada (201):**
```json
{
  "id": 1,
  "peso": 70,
  "altura": 1.75,
  "edad": 25,
  "imc": 22.86,
  "categoria": "Normal",
  "fecha": "2025-09-15T10:35:00.000Z",
  "userId": 2
}
```

### 5. Historial de Cálculos
```http
GET /imc/historial
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta esperada (200):**
```json
[
  {
    "id": 1,
    "peso": 70,
    "altura": 1.75,
    "edad": 25,
    "imc": 22.86,
    "categoria": "Normal",
    "fecha": "2025-09-15T10:35:00.000Z",
    "userId": 2
  },
  {
    "id": 2,
    "peso": 65,
    "altura": 1.70,
    "edad": 30,
    "imc": 22.49,
    "categoria": "Normal",
    "fecha": "2025-09-15T11:00:00.000Z",
    "userId": 2
  }
]
```

---

## 🛠️ Herramientas para Testing

### Usando cURL (Terminal)

#### 1. Registro
```bash
curl -X POST https://tu-app-name.onrender.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456",
    "name": "Usuario de Prueba"
  }'
```

#### 2. Login (guarda el token)
```bash
curl -X POST https://tu-app-name.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

#### 3. Calcular IMC (usando token)
```bash
curl -X POST https://tu-app-name.onrender.com/imc/calcular \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "peso": 70,
    "altura": 1.75,
    "edad": 25
  }'
```

### Usando Postman

1. **Crear una nueva Collection** llamada "Calculadora IMC"

2. **Para endpoints protegidos:**
   - Ve a la pestaña "Authorization" 
   - Selecciona "Bearer Token"
   - Pega el token obtenido del login

3. **Variables de entorno:**
   - Crea una variable `baseUrl` = `https://tu-app-name.onrender.com`
   - Crea una variable `token` para guardar el JWT

### Usando Thunder Client (VS Code)

1. **Instala la extensión Thunder Client**
2. **Crea requests similares a los ejemplos de arriba**
3. **Para autenticación:**
   - En "Headers" agrega: `Authorization: Bearer TU_TOKEN`

---

## 🚨 Posibles Errores

### Error 401 - Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Solución:** Verifica que el token JWT esté en el header Authorization

### Error 400 - Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```
**Solución:** Revisa que los datos cumplan las validaciones

### Error 409 - Conflict (email ya existe)
```json
{
  "statusCode": 409,
  "message": "El email ya está registrado"
}
```
**Solución:** Usa un email diferente para el registro

---

## 📝 Secuencia de Testing Recomendada

1. **Registro** → Crear un nuevo usuario
2. **Login** → Obtener token JWT
3. **Perfil** → Verificar que el token funciona
4. **Calcular IMC** → Hacer algunos cálculos
5. **Historial** → Verificar que se guardan correctamente
6. **Segundo usuario** → Registrar otro usuario y verificar que los datos están separados

---

## 🔍 Validaciones a Verificar

- ✅ Los passwords se encriptan correctamente
- ✅ Los tokens JWT expiran en 24 horas
- ✅ Cada usuario solo ve sus propios cálculos
- ✅ Los cálculos se asocian automáticamente al usuario autenticado
- ✅ CORS permite requests desde tu frontend
