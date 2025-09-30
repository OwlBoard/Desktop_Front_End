// src/pages/PaintPage.tsx
import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Toolbar from "../components/Toolbar";
import PropertiesPanel from "../components/PropertiesPanel";
import Whiteboard from "../components/Whiteboard";
import "../styles/PaintPage.css";

const PaintPage: React.FC = () => {
  const [tool, setTool] = useState<"brush" | "eraser" | "rect" | "circle" | "select">("brush");
  const [color, setColor] = useState<string>("#000000");
  const [size, setSize] = useState<number>(2);
  const [opacity, setOpacity] = useState<number>(1);

  return (
    <div className="paint-page">
      <Container fluid className="h-100">
        <Row className="h-100">

          <Col xs={10} className="canvas-col">
            <div className="stage-wrapper">
              <Whiteboard />
            </div>
          </Col>

        </Row>
      </Container>
    </div>
  );
};

export default PaintPage;
