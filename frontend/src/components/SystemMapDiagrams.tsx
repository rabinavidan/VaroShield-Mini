import { CSSProperties } from "react";

interface FlowProps {
  revealed: boolean;
}

function stagger(delay: string): CSSProperties {
  return { "--d": delay } as CSSProperties;
}

export function BusinessLogicFlow({ revealed }: FlowProps) {
  return (
    <div className="flow-diagram-wrap">
      <svg
        viewBox="0 0 900 1000"
        role="img"
        className={revealed ? "in-view" : ""}
        aria-label="Business logic flow: admin login, create file, start scan, classify content, check exposure, risk evaluation branching into high, low, and safe outcomes, converging into a dashboard update."
      >
        <g className="flow-lines">
          <path className="flow-line" d="M450,94 L450,140" />
          <path className="flow-line" d="M450,214 L450,260" />
          <path className="flow-line" d="M450,334 L450,380" />
          <path className="flow-line" d="M450,454 L450,500" />
          <path className="flow-line" d="M450,574 L450,620" />
          <path className="flow-line" d="M450,694 C450,722 150,732 150,760" />
          <path className="flow-line" d="M450,694 L450,760" />
          <path className="flow-line" d="M450,694 C450,722 750,732 750,760" />
          <path className="flow-line" d="M150,820 C150,848 450,858 450,880" />
          <path className="flow-line" d="M450,820 L450,880" />
          <path className="flow-line" d="M750,820 C750,848 450,858 450,880" />
        </g>

        <g className="flow-node flow-node--endpoint" style={stagger("0.00s")}>
          <rect x="220" y="20" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="51" textAnchor="middle">ADMIN LOGIN</text>
          <text className="flow-sub" x="450" y="70" textAnchor="middle">role: admin</text>
        </g>

        <g className="flow-node" style={stagger("0.06s")}>
          <rect x="220" y="140" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="171" textAnchor="middle">CREATE FILE</text>
          <text className="flow-sub" x="450" y="190" textAnchor="middle">content + permissions</text>
        </g>

        <g className="flow-node" style={stagger("0.12s")}>
          <rect x="220" y="260" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="291" textAnchor="middle">START SCAN</text>
          <text className="flow-sub" x="450" y="310" textAnchor="middle">POST /scan/start</text>
        </g>

        <g className="flow-node" style={stagger("0.18s")}>
          <rect x="220" y="380" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="411" textAnchor="middle">CLASSIFY CONTENT</text>
          <text className="flow-sub" x="450" y="430" textAnchor="middle">sensitive vs. non-sensitive</text>
        </g>

        <g className="flow-node" style={stagger("0.24s")}>
          <rect x="220" y="500" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="531" textAnchor="middle">CHECK EXPOSURE</text>
          <text className="flow-sub" x="450" y="550" textAnchor="middle">public, or shared with "everyone"</text>
        </g>

        <g className="flow-node" style={stagger("0.30s")}>
          <rect x="220" y="620" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="651" textAnchor="middle">RISK EVALUATION</text>
          <text className="flow-sub" x="450" y="670" textAnchor="middle">evaluate_file_risk()</text>
        </g>

        <g className="flow-chip flow-chip--high" style={stagger("0.36s")}>
          <rect x="40" y="760" width="220" height="60" rx="30" />
          <text className="flow-label" x="150" y="784" textAnchor="middle">HIGH</text>
          <text className="flow-sub" x="150" y="802" textAnchor="middle">sensitive + exposed</text>
        </g>

        <g className="flow-chip flow-chip--low" style={stagger("0.40s")}>
          <rect x="340" y="760" width="220" height="60" rx="30" />
          <text className="flow-label" x="450" y="784" textAnchor="middle">LOW</text>
          <text className="flow-sub" x="450" y="802" textAnchor="middle">non-sensitive + public</text>
        </g>

        <g className="flow-chip flow-chip--safe" style={stagger("0.44s")}>
          <rect x="640" y="760" width="220" height="60" rx="30" />
          <text className="flow-label" x="750" y="784" textAnchor="middle">SAFE</text>
          <text className="flow-sub" x="750" y="802" textAnchor="middle">sensitive + private</text>
        </g>

        <g className="flow-node flow-node--endpoint" style={stagger("0.52s")}>
          <rect x="220" y="880" width="460" height="84" rx="10" />
          <text className="flow-label" x="450" y="915" textAnchor="middle">DASHBOARD UPDATE</text>
          <text className="flow-sub" x="450" y="937" textAnchor="middle">live: files · sensitive · exposure · alerts</text>
        </g>
      </svg>
    </div>
  );
}

export function TestAutomationFlow({ revealed }: FlowProps) {
  return (
    <div className="flow-diagram-wrap">
      <svg
        viewBox="0 0 900 900"
        role="img"
        className={revealed ? "in-view" : ""}
        aria-label="Test automation layers: API tests through clients to FastAPI, and UI tests through page objects to Playwright and React, both converging on the live Docker Compose stack, then Allure results, then CI on GitHub Actions, then a published report."
      >
        <g className="flow-lines">
          <path className="flow-line" d="M190,90 L190,140" />
          <path className="flow-line" d="M190,210 L190,260" />
          <path className="flow-line" d="M710,90 L710,140" />
          <path className="flow-line" d="M710,210 L710,260" />
          <path className="flow-line" d="M190,330 C190,372 450,372 450,400" />
          <path className="flow-line" d="M710,330 C710,372 450,372 450,400" />
          <path className="flow-line" d="M450,474 L450,520" />
          <path className="flow-line" d="M450,590 L450,640" />
          <path className="flow-line" d="M450,710 L450,760" />
        </g>

        <g className="flow-node flow-node--endpoint" style={stagger("0.00s")}>
          <rect x="30" y="20" width="320" height="70" rx="10" />
          <text className="flow-label" x="190" y="49" textAnchor="middle">API TESTS</text>
          <text className="flow-sub" x="190" y="68" textAnchor="middle">pytest -m api</text>
        </g>
        <g className="flow-node flow-node--endpoint" style={stagger("0.00s")}>
          <rect x="550" y="20" width="320" height="70" rx="10" />
          <text className="flow-label" x="710" y="49" textAnchor="middle">UI TESTS</text>
          <text className="flow-sub" x="710" y="68" textAnchor="middle">pytest -m ui</text>
        </g>

        <g className="flow-node" style={stagger("0.08s")}>
          <rect x="30" y="140" width="320" height="70" rx="10" />
          <text className="flow-label" x="190" y="169" textAnchor="middle">CLIENTS</text>
          <text className="flow-sub" x="190" y="188" textAnchor="middle">auth · files · scan · risks · dashboard</text>
        </g>
        <g className="flow-node" style={stagger("0.08s")}>
          <rect x="550" y="140" width="320" height="70" rx="10" />
          <text className="flow-label" x="710" y="169" textAnchor="middle">PAGE OBJECTS</text>
          <text className="flow-sub" x="710" y="188" textAnchor="middle">login · dashboard · files · risks</text>
        </g>

        <g className="flow-node" style={stagger("0.16s")}>
          <rect x="30" y="260" width="320" height="70" rx="10" />
          <text className="flow-label" x="190" y="289" textAnchor="middle">REQUESTS → FASTAPI</text>
          <text className="flow-sub" x="190" y="308" textAnchor="middle">direct HTTP calls</text>
        </g>
        <g className="flow-node" style={stagger("0.16s")}>
          <rect x="550" y="260" width="320" height="70" rx="10" />
          <text className="flow-label" x="710" y="289" textAnchor="middle">PLAYWRIGHT → REACT</text>
          <text className="flow-sub" x="710" y="308" textAnchor="middle">browser-driven journeys</text>
        </g>

        <g className="flow-node flow-node--endpoint" style={stagger("0.28s")}>
          <rect x="220" y="400" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="431" textAnchor="middle">LIVE STACK</text>
          <text className="flow-sub" x="450" y="450" textAnchor="middle">docker compose: postgres + fastapi + react</text>
        </g>

        <g className="flow-node" style={stagger("0.34s")}>
          <rect x="220" y="520" width="460" height="70" rx="10" />
          <text className="flow-label" x="450" y="549" textAnchor="middle">ALLURE RESULTS</text>
          <text className="flow-sub" x="450" y="568" textAnchor="middle">nested @allure.step per action</text>
        </g>

        <g className="flow-node" style={stagger("0.40s")}>
          <rect x="220" y="640" width="460" height="70" rx="10" />
          <text className="flow-label" x="450" y="669" textAnchor="middle">CI: GITHUB ACTIONS</text>
          <text className="flow-sub" x="450" y="688" textAnchor="middle">build → health check → smoke tests</text>
        </g>

        <g className="flow-node flow-node--endpoint" style={stagger("0.48s")}>
          <rect x="220" y="760" width="460" height="84" rx="10" />
          <text className="flow-label" x="450" y="795" textAnchor="middle">REPORT PUBLISHED</text>
          <text className="flow-sub" x="450" y="817" textAnchor="middle">github pages + job summary link</text>
        </g>
      </svg>
    </div>
  );
}
