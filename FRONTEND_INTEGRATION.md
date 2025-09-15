# Guía de Integración Frontend - API Calculadora IMC

## Configuración Base

### URL de la API
- **Local**: `http://localhost:3000`
- **Producción**: Tu URL de Render (ej: `https://tu-app.onrender.com`)

## Flujo de Autenticación

### 1. Registro de Usuario
```javascript
const response = await fetch('${API_URL}/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: 'contraseña123',
    name: 'Nombre Usuario' // opcional
  })
});

const { user, access_token } = await response.json();
// Guardar el token para futuras peticiones
localStorage.setItem('token', access_token);
```

### 2. Login de Usuario
```javascript
const response = await fetch('${API_URL}/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'usuario@ejemplo.com',
    password: 'contraseña123'
  })
});

const { user, access_token } = await response.json();
localStorage.setItem('token', access_token);
```

### 3. Verificar Token (Obtener Perfil)
```javascript
const token = localStorage.getItem('token');
const response = await fetch('${API_URL}/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const user = await response.json();
```

## Operaciones IMC (Requieren Autenticación)

### 1. Calcular IMC
```javascript
const token = localStorage.getItem('token');
const response = await fetch('${API_URL}/imc/calcular', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    altura: 1.75, // en metros
    peso: 70      // en kilogramos
  })
});

const { imc, categoria } = await response.json();
```

### 2. Obtener Historial
```javascript
const token = localStorage.getItem('token');
const response = await fetch('${API_URL}/imc/historial?limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const historial = await response.json();
// Array de cálculos del usuario
```

## Manejo de Errores

### Errores de Validación (400)
```javascript
try {
  const response = await fetch('/auth/register', { /* ... */ });
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Error de validación:', error.message);
    // Mostrar errores al usuario
  }
} catch (error) {
  console.error('Error de red:', error);
}
```

### Token Expirado (401)
```javascript
const response = await fetch('/imc/calcular', {
  headers: { 'Authorization': `Bearer ${token}` }
});

if (response.status === 401) {
  // Token expirado o inválido
  localStorage.removeItem('token');
  // Redirigir al login
  window.location.href = '/login';
}
```

## Ejemplo de Hook React

```javascript
// useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      logout();
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const { user, access_token } = await response.json();
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(user);
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, name) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    if (response.ok) {
      const { user, access_token } = await response.json();
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(user);
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const calculateIMC = async (altura, peso) => {
    const response = await fetch(`${API_URL}/imc/calcular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ altura, peso })
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Error al calcular IMC');
    }
  };

  const getHistory = async (limit = 20) => {
    const response = await fetch(`${API_URL}/imc/historial?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error('Error al obtener historial');
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    calculateIMC,
    getHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Notas Importantes

1. **Tokens JWT**: Expiran en 24 horas, manejar la renovación o re-login
2. **HTTPS**: En producción, usar siempre HTTPS para las peticiones
3. **Variables de Entorno**: Configurar la URL de la API según el entorno
4. **Manejo de Estados**: Implementar loading states y manejo de errores
5. **Seguridad**: No exponer tokens en logs o consola del navegador
