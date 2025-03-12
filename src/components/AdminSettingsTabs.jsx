import { useState } from "react"
import { Nav, Tab } from "react-bootstrap"

export default function AdminSettingsTabs({ children }) {
  const [activeTab, setActiveTab] = useState("general")

  return (
    <Tab.Container activeKey={activeTab} onSelect={(key) => setActiveTab(key)}>
      <Nav variant="tabs">
        <Nav.Item>
          <Nav.Link eventKey="general">Général</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="navigation">Navigation</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="footer">Footer</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="forms">Formulaires</Nav.Link>
        </Nav.Item>
      </Nav>

      <Tab.Content className="mt-3">
        {children(activeTab)}
      </Tab.Content>
    </Tab.Container>
  )
}
