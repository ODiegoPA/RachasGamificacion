import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Container, Form, Alert } from "react-bootstrap";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.removeItem("user");
  }, []);

  const handleRegister = async () => {
    if (!nombres || !email || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/usuario/register", {
        nombres,
        apellidos,
        email,
        password,
      });
      console.log("Registro exitoso:", response.data);

      setError(null);
      navigate("/login");
    } catch (error) {
      console.error("Error al registrarse:", error);
      setError("No se pudo completar el registro.");
    }
  };

  return (
    <>
      <Container className="login-container">
        <Row className="justify-content-md-center">
          <Col>
            <Card className="login-card shadow">
              <Card.Body>
                <Card.Title className="text-center mb-4">Crear cuenta</Card.Title>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa tu nombre"
                      value={nombres}
                      onChange={(event) => setNombres(event.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Apellidos</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Ingresa tu apellido"
                      value={apellidos}
                      onChange={(event) => setApellidos(event.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Ingresa tu correo"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Contraseña</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Crea una contraseña"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </Form.Group>
                  <Button variant="primary" className="w-100" onClick={handleRegister}>
                    Registrarme
                  </Button>
                  <Link to={"/register"}>Ya tenes cuenta? inicia sesion</Link>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default RegisterPage;
