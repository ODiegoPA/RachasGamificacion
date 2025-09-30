import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Row, Container, Form, Alert, Modal } from "react-bootstrap";
import NavMainMenu from "../components/MainMenu";
const toYmd = (v) => {
  if (!v) return "";
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (isNaN(d)) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const AdminPage = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [fechaSimulada, setFechaSimulada] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  const [confirm, setConfirm] = useState({
    show: false,
    title: "",
    body: "",
    action: null,
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;
    const u = parsed?.user || parsed;
    if (!u?.id) {
      navigate("/login");
      return;
    }
    cargarFecha();
    setUser(u);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openConfirm = (title, body, action) => {
    setConfirm({ show: true, title, body, action });
  };
  const closeConfirm = () => setConfirm({ show: false, title: "", body: "", action: null });
  const cargarFecha = async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/fecha");
      const f = data?.fecha || data;
      setFecha(f || {});
      setFechaSimulada(toYmd(f?.fechaSimulada));
    // eslint-disable-next-line no-unused-vars
    } catch (e) {
      setFecha({});
    }
  };
  const doModificarFecha = async () => {
    if (!fechaSimulada) {
      setError("Selecciona una fecha antes de guardar.");
      closeConfirm();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post("http://localhost:3000/fecha/modificar", {
        fechaSimulada,
      });
      setMsg(data?.msg || "Fecha modificada exitosamente.");
    } catch (e) {
      setError("No se pudo modificar la fecha.", e);
    } finally {
      setLoading(false);
      closeConfirm();
    }
  };

  const doResetFecha = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post("http://localhost:3000/fecha/reset");
      setMsg(data?.msg || "Fecha reiniciada.");
    } catch (e) {
      setError("No se pudo reiniciar la fecha.", e);
    } finally {
      setLoading(false);
      closeConfirm();
    }
  };

  const doGenerarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post("http://localhost:3000/historial/generar");
      setMsg(data?.msg || "Historial generado y rachas reseteadas.");
    } catch (e) {
      setError("No se pudo generar el historial.", e);
    } finally {
      setLoading(false);
      closeConfirm();
    }
  };

  return (
    <>
      <NavMainMenu />

      <Container className="py-4">
        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8}>
            <Card className="shadow">
              <Card.Body>
                <Card.Title className="mb-3">Panel de Administración</Card.Title>

                {msg && <Alert variant="success" onClose={() => setMsg(null)} dismissible>{msg}</Alert>}
                {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

                <Form onSubmit={(e) => e.preventDefault()}>
                  <Row className="g-3">

                    <Col xs={12}>
                      Cambiar fecha simulada — Fecha simulada actual: {toYmd(fecha?.fechaSimulada) || "(Ninguna)"}
                      <Row className="g-2">
                        <Col xs={12} md={6}>
                          <Form.Label>Fecha (YYYY-MM-DD)</Form.Label>
                          <Form.Control
                            type="date"
                            value={fechaSimulada}
                            onChange={(e) => setFechaSimulada(e.target.value)}
                          />
                        </Col>
                        <Col xs={12} md={6} className="d-flex align-items-end">
                          <Button
                            variant="primary"
                            className="w-100"
                            disabled={loading}
                            onClick={() =>
                              openConfirm(
                                "Confirmar cambio de fecha",
                                `Se cambiará la fecha simulada a ${fechaSimulada || "(sin seleccionar)"}.`,
                                doModificarFecha
                              )
                            }
                          >
                            Guardar fecha simulada
                          </Button>
                        </Col>
                      </Row>
                    </Col>

                    <Col xs={12}>
                      <hr />
                      <h6 className="mb-2">Reiniciar fecha simulada</h6>
                      <Row>
                        <Col xs={12} md={6}>
                          <div className="text-muted small mb-2">
                            Restablece la configuración de fecha. No requiere parámetros.
                          </div>
                        </Col>
                        <Col xs={12} md={6} className="d-flex align-items-end">
                          <Button
                            variant="secondary"
                            className="w-100"
                            disabled={loading}
                            onClick={() =>
                              openConfirm(
                                "Confirmar reinicio de fecha",
                                "Se reiniciará la fecha simulada a su estado por defecto.",
                                doResetFecha
                              )
                            }
                          >
                            Resetear fecha
                          </Button>
                        </Col>
                      </Row>
                    </Col>

                    <Col xs={12}>
                      <hr />
                      <h6 className="mb-2">Generar historial del mes anterior</h6>
                      <div className="text-muted small mb-2">
                        Esta acción generará el historial del mes anterior y <strong>REINICIARÁ todas las rachas</strong>.
                        Úsalo <strong>solo al inicio del mes</strong>.
                      </div>
                      <Button
                        variant="danger"
                        className="w-100"
                        disabled={loading}
                        onClick={() =>
                          openConfirm(
                            "Confirmar generación de historial",
                            "Se generará el historial del mes anterior y se reiniciarán todas las rachas. Esta acción debería usarse solo al principio del mes.",
                            doGenerarHistorial
                          )
                        }
                      >
                        Generar historial y reiniciar rachas
                      </Button>
                    </Col>

                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Modal show={confirm.show} onHide={closeConfirm} centered>
        <Modal.Header closeButton>
          <Modal.Title>{confirm.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{confirm.body}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeConfirm} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={confirm.action || closeConfirm}
            disabled={loading}
          >
            {loading ? "Procesando..." : "Confirmar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminPage;
