import { NODE_COLORS, type CanvasEdge, type CanvasNode, type CanvasNodeShape, type NodeColor } from "@/types/canvas"

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

function templateNode(
  id: string,
  label: string,
  shape: CanvasNodeShape,
  position: { x: number; y: number },
  color: NodeColor = NODE_COLORS[0],
  size = { width: 150, height: 72 },
): CanvasNode {
  return {
    id,
    type: "canvasNode",
    position,
    width: size.width,
    height: size.height,
    data: { label, shape, color: color.fill, textColor: color.text },
  }
}

function templateEdge(id: string, source: string, target: string, label = ""): CanvasEdge {
  return { id, source, target, type: "canvasEdge", data: { label } }
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices platform",
    description: "An API gateway routes requests to independently deployable services and their data stores.",
    nodes: [
      templateNode("client", "Web client", "rectangle", { x: 0, y: 90 }, NODE_COLORS[1]),
      templateNode("gateway", "API gateway", "hexagon", { x: 230, y: 90 }, NODE_COLORS[3]),
      templateNode("users", "User service", "pill", { x: 490, y: 0 }, NODE_COLORS[2]),
      templateNode("orders", "Order service", "pill", { x: 490, y: 180 }, NODE_COLORS[6]),
      templateNode("user-db", "User DB", "cylinder", { x: 750, y: 0 }, NODE_COLORS[7]),
      templateNode("order-db", "Order DB", "cylinder", { x: 750, y: 180 }, NODE_COLORS[7]),
    ],
    edges: [templateEdge("client-gateway", "client", "gateway"), templateEdge("gateway-users", "gateway", "users"), templateEdge("gateway-orders", "gateway", "orders"), templateEdge("users-db", "users", "user-db"), templateEdge("orders-db", "orders", "order-db")],
  },
  {
    id: "ci-cd",
    name: "CI/CD pipeline",
    description: "A change moves through source control, validation, artifact creation, and production deployment.",
    nodes: [
      templateNode("commit", "Commit", "circle", { x: 0, y: 90 }, NODE_COLORS[1], { width: 110, height: 64 }),
      templateNode("build", "Build", "pill", { x: 210, y: 90 }, NODE_COLORS[3]),
      templateNode("test", "Test", "diamond", { x: 440, y: 90 }, NODE_COLORS[5]),
      templateNode("artifact", "Artifact", "cylinder", { x: 670, y: 90 }, NODE_COLORS[7]),
      templateNode("deploy", "Deploy", "hexagon", { x: 900, y: 90 }, NODE_COLORS[6]),
    ],
    edges: [templateEdge("commit-build", "commit", "build"), templateEdge("build-test", "build", "test"), templateEdge("test-artifact", "test", "artifact", "pass"), templateEdge("artifact-deploy", "artifact", "deploy")],
  },
  {
    id: "event-driven",
    name: "Event-driven system",
    description: "A producer publishes events to a broker while independent consumers react asynchronously.",
    nodes: [
      templateNode("producer", "Producer", "pill", { x: 0, y: 100 }, NODE_COLORS[1]),
      templateNode("broker", "Event broker", "cylinder", { x: 280, y: 100 }, NODE_COLORS[3]),
      templateNode("consumer-a", "Analytics", "pill", { x: 570, y: 0 }, NODE_COLORS[2]),
      templateNode("consumer-b", "Notifications", "pill", { x: 570, y: 200 }, NODE_COLORS[6]),
      templateNode("read-model", "Read model", "cylinder", { x: 850, y: 0 }, NODE_COLORS[7]),
    ],
    edges: [templateEdge("producer-broker", "producer", "broker", "publish"), templateEdge("broker-analytics", "broker", "consumer-a"), templateEdge("broker-notifications", "broker", "consumer-b"), templateEdge("analytics-model", "consumer-a", "read-model")],
  },
]
