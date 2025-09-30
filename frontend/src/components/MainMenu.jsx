import { Container, Navbar, Form, Button, Row, Col, Nav, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import rachaLogo from './racha.png'
import './MainMenu.css'
const NavMainMenu = () => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };
    return ( 
        <Navbar expand="lg" bg="dark" variant="dark" className="main-menu">
            <Container className="justify-content-center">
            <Navbar.Brand href="/inicio">
                <img src={rachaLogo} alt="Racha Logo" class="racha-logo"></img>
                RachaTrabajos
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    <Link className="nav-link" to={"/inicio"}>Inicio </Link>
                </Nav>
                <Nav className="mr-auto">
                    <Link className="nav-link" to={"/rankings"}>Ranking Mensual </Link>
                </Nav>
                <Nav className="mr-auto">
                    <Link className="nav-link" to={"/historial"}>Historial </Link>
                </Nav>
                    <Link variant="outline-light" className="nav-button" onClick={handleLogout}>
                    Cerrar Sesion
                </Link>
            </Navbar.Collapse>
            </Container>
        </Navbar>
     );
}
 
export default NavMainMenu;