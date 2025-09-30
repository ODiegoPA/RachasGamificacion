import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Table, Badge } from "react-bootstrap";
import NavMainMenu from "../components/MainMenu";
import RachaActiva from "./racha.png";
import RachaGris from "./rachaGris.png";

const RankingsPage = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);
  const [mes, setMes] = useState(null);
  const [anio, setAnio] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const parsed = stored ? JSON.parse(stored) : null;
    const u = parsed?.user || parsed;
    if (!u?.id) {
      navigate("/login");
      return;
    }
    setUser(u);
    fetchRanking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("http://localhost:3000/racha/mes");
      setMes(data?.mes ?? null);
      setAnio(data?.anio ?? null);
      const list = Array.isArray(data?.rachas) ? data.rachas.slice(0, 10) : [];
      setItems(list);
    } catch (err) {
      setError("No se pudo cargar el ranking del mes.", err);
      setItems([]);
    } finally {
      setLoading(false);
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
                <Card.Title className="mb-3">
                  Ranking del mes {mes ? String(mes).padStart(2, "0") : "--"}/{anio ?? "--"}
                </Card.Title>

                {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
                {loading && <Alert variant="secondary">Cargando...</Alert>}

                {!loading && items.length === 0 && (
                  <Alert variant="info">Aún no hay rachas registradas este mes.</Alert>
                )}

                {!loading && items.length > 0 && (
                  <Table hover responsive className="align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Usuario</th>
                        <th className="text-center">Días</th>
                        <th className="text-center">Puntos</th>
                        <th className="text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((r, idx) => {
                        const nombre = (r.usuario?.nombres || "") + " " + (r.usuario?.apellidos || "");
                        const on = !!r.estaPrendida;
                        return (
                          <tr key={r.id}>
                            <td>{idx + 1}</td>
                            <td>
                              <img
                                src={on ? RachaActiva : RachaGris}
                                alt="estado"
                                style={{ width: 24, height: 24, objectFit: "contain" }}
                                className="me-2"
                              />
                              {nombre.trim() || `Usuario ${r.usuarioId}`}
                            </td>
                            <td className="text-center">{r.dias ?? 0}</td>
                            <td className="text-center"><strong>{r.puntos ?? 0}</strong></td>
                            <td className="text-center">
                              <Badge bg={on ? "success" : "secondary"}>
                                {on ? "Prendida" : "Apagada"}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
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

export default RankingsPage;
