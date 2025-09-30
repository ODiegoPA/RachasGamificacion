import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Container, Alert, Navbar } from "react-bootstrap";
import RachaActiva from "./racha.png";
import RachaGris from "./rachaGris.png";
import NavMainMenu from "../components/MainMenu";

const InicioPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [racha, setRacha] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;
    const u = parsed?.user || parsed;
    if (!u?.id) {
      navigate("/login");
      return;
    }
    setUser(u);
    cargarRacha(u.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarRacha = async (usuarioId) => {
    try {
      setError(null);
      const { data } = await axios.get(`http://localhost:3000/racha/usuario/${usuarioId}`);
      setRacha(data?.racha || data);
    } catch {
      setRacha({ dias: 0, puntos: 0, estaPrendida: false });
    }
  };

  const handleVerificar = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      await axios.post(`http://localhost:3000/racha/verificar/${user.id}`);
      window.location.reload();
    } catch (err) {
      setError("No se pudo verificar la racha.", err);
    } finally {
      setLoading(false);
    }
  };

  const isOn = !!racha?.estaPrendida;
  const dias = racha?.dias ?? 0;
  const puntos = racha?.puntos ?? 0;

  return (
    <>
      <NavMainMenu/>
      <Container className="mt-4">
        <Row className="justify-content-md-center">
            <Card className="shadow">
              <Card.Body>
                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                <div className="text-center">
                  <img
                    src={isOn ? RachaActiva : RachaGris}
                    alt="Estado de racha"
                    className="img-fluid mb-3"
                    style={{ maxWidth: "240px" }}
                  />
                  <h5 className="mb-3">
                    {isOn ? "Tu racha está prendida" : "Tu racha está apagada"}
                  </h5>
                </div>
                <Row className="text-center mb-3">
                  <Col>
                    <div><strong>Días</strong></div>
                    <div>{dias}</div>
                  </Col>
                  <Col>
                    <div><strong>Puntos</strong></div>
                    <div>{puntos}</div>
                  </Col>
                </Row>
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={handleVerificar}
                  disabled={loading}
                >
                  {loading ? "Procesando..." : "Verificar / Activar racha"}
                </Button>
              </Card.Body>
            </Card>
        </Row>
      </Container>
    </>
  );
};

export default InicioPage;
