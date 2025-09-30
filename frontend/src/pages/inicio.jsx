import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Container, Alert, Modal } from "react-bootstrap";
import RachaActiva from "./racha.png";
import RachaGris from "./rachaGris.png";
import NavMainMenu from "../components/MainMenu";

const InicioPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [racha, setRacha] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    title: "",
    body: "",
    variant: "info",
    shouldReload: false,
  });

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

  //funcion pura
  //inmutabilidad
  const buildPopupFromAccion = (accion, r) => {
    const dias = r?.dias ?? 0;
    const puntos = r?.puntos ?? 0;

    switch (accion) {
      case "primera_vez":
        return {
          title: "¡Racha activada!",
          body: "Iniciaste tu racha por primera vez. Vuelve mañana para empezar a sumar.",
          variant: "success",
          shouldReload: true,
        };
      case "dia_siguiente_sumado":
        return {
          title: "¡Sumaste a tu racha!",
          body: `Bien ahí. Llevas ${dias} día(s) y acumulas ${puntos} punto(s).`,
          variant: "success",
          shouldReload: true,
        };
      case "racha_rotay_reinicia":
        return {
          title: "Tu racha se había cortado",
          body: "Se reinició la racha. Desde hoy vuelve a empezar.",
          variant: "warning",
          shouldReload: true,
        };
      case "mismo_dia":
        return {
          title: "Ya verificaste hoy",
          body: "Vuelve mañana para seguir sumando.",
          variant: "info",
          shouldReload: false,
        };
      case "sin_cambios":
      default:
        return {
          title: "Sin cambios",
          body: "No hubo cambios en tu racha.",
          variant: "secondary",
          shouldReload: false,
        };
    }
  };

  const handleVerificar = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data } = await axios.post(`http://localhost:3000/racha/verificar/${user.id}`);
      const accion = data?.accion;
      const r = data?.racha;
      const p = buildPopupFromAccion(accion, r);
      setPopup({ ...p, show: true });
    } catch (err) {
      setError("No se pudo verificar la racha.", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    const { shouldReload } = popup;
    setPopup({ show: false, title: "", body: "", variant: "info", shouldReload: false });
    if (shouldReload) {
      window.location.reload();
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

      <Modal show={popup.show} onHide={handleClosePopup} centered>
        <Modal.Header closeButton>
          <Modal.Title>{popup.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{popup.body}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClosePopup}>
            Entendido
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InicioPage;
