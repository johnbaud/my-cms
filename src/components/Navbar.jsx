import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, NavDropdown, Container } from "react-bootstrap";

export default function CustomNavbar({ settings, navLinks }) {
  if (!settings || !navLinks) return null; // Sécurisation

  return (
    <Navbar expand="lg" style={{ backgroundColor: settings.navBgColor,  height: `${settings.navHeight}px` }}>
      <Container  style={{ justifyContent: settings.navAlignment === "left" ? "flex-start" : settings.navAlignment === "right" ? "flex-end": "space-between"}}>
        <Navbar.Brand as={Link} to="/">
          {settings.showLogo && (
            <img
              src={settings.logo}
              alt="Logo"
              style={{ maxHeight: "40px", marginRight: "10px" }}
            />
          )}
          {settings.showSiteName && (
            <span style={{ color: settings.navTextColor }}>
              {settings.siteName}
            </span>
          )}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {navLinks.map((link) =>
              link.type === "dropdown" ? (
                <NavDropdown
                  key={link.id}
                  title={link.label}
                  id={`dropdown-${link.id}`}
                  style={{ color: settings.navTextColor }}
                  className="custom-dropdown"
                >
                  {link.children?.map((child) => (
                    <NavDropdown.Item
                      key={child.id}
                      as={Link}
                      to={child.type === "internal" ? `/${child.page?.slug || "#"}` : undefined}
                      href={child.type === "external" ? child.url : undefined}
                      target={child.type === "external" ? "_blank" : undefined}
                      rel={child.type === "external" ? "noopener noreferrer" : undefined}
                      style={{ backgroundColor: settings.navBgColor, color: settings.navTextColor }}
                    >
                      {child.label}
                    </NavDropdown.Item>
                  ))}
                </NavDropdown>
              ) : (
                <Nav.Link
                  key={link.id}
                  as={Link}
                  to={`/${link.page?.slug || "#"}`}
                  style={{ color: settings.navTextColor }}
                >
                  {link.label}
                </Nav.Link>
              )
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

