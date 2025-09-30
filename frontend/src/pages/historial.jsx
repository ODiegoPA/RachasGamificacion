import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Form, Button, Alert, Table, Badge } from "react-bootstrap";
import NavMainMenu from "../components/MainMenu";

const meses = [
  { v: 1,  n: "Enero" },      { v: 2,  n: "Febrero" },
  { v: 3,  n: "Marzo" },      { v: 4,  n: "Abril" },
  { v: 5,  n: "Mayo" },       { v: 6,  n: "Junio" },
  { v: 7,  n: "Julio" },      { v: 8,  n: "Agosto" },
  { v: 9,  n: "Septiembre" }, { v: 10, n: "Octubre" },
  { v: 11, n: "Noviembre" },  { v: 12, n: "Diciembre" },
];

const HistorialPage = () => {
  const navigate = useNavigate();
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [ano, setAno] = useState(hoy.getFullYear());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [periodo, setPeriodo] = useState({ mes: null, ano: null });
  const [resumen, setResumen] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [data, setData] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;
    const u = parsed?.user || parsed;
    if (!u?.id) {
      navigate("/login");
      return;
    }
    buscar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscar = async () => {
  const body = { mes: Number(mes), ano: Number(ano) };
  try {
    setLoading(true);
    setError(null);

    const resp = await axios.post("http://localhost:3000/historial/periodo", body);
    const d = resp.data || {};

    setPeriodo({ mes: d?.periodo?.mes, ano: d?.periodo?.ano });

    const resumenOrdenado = Array.isArray(d?.resumenPorUsuario)
      ? [...d.resumenPorUsuario].sort((a, b) =>
          (b.puntosTotales ?? 0) - (a.puntosTotales ?? 0) ||
          (b.diasTotales ?? 0) - (a.diasTotales ?? 0)
        )
      : [];
    setResumen(resumenOrdenado);
    setData(Array.isArray(d?.data) ? d.data : []);
  } catch (e) {
    setError("No se pudo cargar el historial del período.", e);
    setResumen([]);
    setData([]);
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <NavMainMenu />
      <Container className="py-4">
        <Row className="justify-content-center mb-3">
          <Col xs={12} md={10} lg={8}>
            <Card className="shadow">
              <Card.Body>
                <Card.Title className="mb-3">Historial por período</Card.Title>

                <Form className="mb-3" onSubmit={(e) => e.preventDefault()}>
                  <Row className="g-2">
                    <Col xs={12} md={6}>
                      <Form.Label>Mes</Form.Label>
                      <Form.Select value={String(mes)} onChange={(e) => setMes(Number(e.target.value))}>
                        {meses.map(m => (
                            <option key={m.v} value={String(m.v)}>
                            {String(m.v).padStart(2, "0")} - {m.n}
                            </option>
                        ))}
                        </Form.Select>
                    </Col>
                    <Col xs={12} md={4}>
                      <Form.Label>Año</Form.Label>
                      <Form.Control
                        type="number"
                        value={ano}
                        onChange={(e) => setAno(Number(e.target.value))}
                        placeholder="2025"
                      />
                    </Col>
                    <Col xs={12} md={2} className="d-flex align-items-end">
                      <Button className="w-100" onClick={buscar} disabled={loading}>
                        {loading ? "Buscando..." : "Buscar"}
                      </Button>
                    </Col>
                  </Row>
                </Form>

                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

                <div className="mb-2">
                  <small className="text-muted">
                    Período: {periodo.mes ?? "--"}/{periodo.ano ?? "--"}
                  </small>
                </div>

                <h6 className="mt-2">Resumen por usuario</h6>
                {resumen.length === 0 ? (
                  <Alert variant="info" className="mb-3">Sin datos para el período seleccionado.</Alert>
                ) : (
                  <Table hover responsive size="sm" className="align-middle mb-4">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>UsuarioId</th>
                        <th className="text-center">Puntos totales</th>
                        <th className="text-center">Días totales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumen.map((r, idx) => (
                        <tr key={r.usuarioId}>
                          <td>{idx + 1}</td>
                          <td>{r.usuarioId}</td>
                          <td className="text-center"><Badge bg="primary">{r.puntosTotales ?? 0}</Badge></td>
                          <td className="text-center">{r.diasTotales ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HistorialPage;
