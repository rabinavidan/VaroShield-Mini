import { ComponentType, CSSProperties } from "react";
import {
  AwsIcon,
  BoxIcon,
  GitHubIcon,
  GoogleDriveIcon,
  MicrosoftTeamsIcon,
  SalesforceIcon,
  SlackIcon,
} from "./SourceIcons";

interface FlowProps {
  revealed: boolean;
}

function stagger(delay: string): CSSProperties {
  return { "--d": delay } as CSSProperties;
}

interface SourceIconMeta {
  Icon: ComponentType<{ size?: number }>;
  color: string;
}

// Same brand colors as pages/FilesPage.tsx's SOURCE_META, kept in sync manually.
const SOURCE_ROW: SourceIconMeta[] = [
  { Icon: GoogleDriveIcon, color: "#4285F4" },
  { Icon: SalesforceIcon, color: "#00A1E0" },
  { Icon: AwsIcon, color: "#232F3E" },
  { Icon: BoxIcon, color: "#0061D5" },
  { Icon: GitHubIcon, color: "#181717" },
  { Icon: SlackIcon, color: "#4A154B" },
  { Icon: MicrosoftTeamsIcon, color: "#6264A7" },
];

function SourceIconRow({ y }: { y: number }) {
  const spacing = 50;
  const startX = 450 - ((SOURCE_ROW.length - 1) * spacing) / 2;
  return (
    <g className="flow-source-row">
      {SOURCE_ROW.map(({ Icon, color }, i) => (
        <g key={i} transform={`translate(${startX + i * spacing}, ${y})`}>
          <circle className="flow-source-badge" r="11" />
          <g transform="translate(-8, -8)" style={{ color }}>
            <Icon size={16} />
          </g>
        </g>
      ))}
    </g>
  );
}

interface FlowLine {
  d: string;
  begin: number;
}

function FlowLines({ lines, revealed }: { lines: FlowLine[]; revealed: boolean }) {
  return (
    <>
      <g className="flow-lines">
        {lines.map((line, i) => (
          <path key={i} className="flow-line" d={line.d} />
        ))}
      </g>
      {revealed && (
        <g className="flow-pulses">
          {lines.map((line, i) => (
            <circle key={i} className="flow-pulse" r="4">
              <animateMotion dur="1.7s" repeatCount="indefinite" begin={`${line.begin}s`} path={line.d} />
            </circle>
          ))}
        </g>
      )}
    </>
  );
}

const BUSINESS_LOGIC_LINES: FlowLine[] = [
  { d: "M450,94 L450,140", begin: 0.0 },
  { d: "M450,214 L450,260", begin: 0.15 },
  { d: "M450,334 L450,380", begin: 0.3 },
  { d: "M450,454 L450,500", begin: 0.45 },
  { d: "M450,574 L450,620", begin: 0.6 },
  { d: "M450,694 C450,722 150,732 150,760", begin: 0.75 },
  { d: "M450,694 L450,760", begin: 0.75 },
  { d: "M450,694 C450,722 750,732 750,760", begin: 0.75 },
  { d: "M150,820 C150,848 450,858 450,880", begin: 0.95 },
  { d: "M450,820 L450,880", begin: 0.95 },
  { d: "M750,820 C750,848 450,858 450,880", begin: 0.95 },
];

export function BusinessLogicFlow({ revealed }: FlowProps) {
  return (
    <div className="flow-diagram-wrap">
      <svg
        viewBox="0 0 900 1000"
        role="img"
        className={revealed ? "in-view" : ""}
        aria-label="Business logic flow: admin login, create file on the Files tab, start scan from the Dashboard tab, classify content, check exposure, risk evaluation branching into high, low, and safe outcomes shown on the Risks tab, converging into a Dashboard update."
      >
        <FlowLines lines={BUSINESS_LOGIC_LINES} revealed={revealed} />

        <g className="flow-node flow-node--endpoint" style={stagger("0.00s")}>
          <rect x="220" y="20" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="51" textAnchor="middle">ADMIN LOGIN</text>
          <text className="flow-sub" x="450" y="70" textAnchor="middle">role: admin</text>
          <circle className="flow-node-glow" cx="240" cy="57" r="4" />
        </g>

        <g className="flow-node" style={stagger("0.06s")}>
          <rect x="220" y="140" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="171" textAnchor="middle">CREATE FILE</text>
          <text className="flow-sub" x="450" y="190" textAnchor="middle">content + source + permissions</text>
          <text className="flow-tab-tag" x="700" y="190" textAnchor="start">↳ Files tab</text>
          <circle className="flow-node-glow" cx="240" cy="177" r="4" />
        </g>

        <g className="flow-detail-row" style={stagger("0.09s")}>
          <SourceIconRow y={225} />
          <text className="flow-ext-tag" x="450" y="250" textAnchor="middle">
            .csv · .pdf · .xlsx · .docx · .json
          </text>
        </g>

        <g className="flow-node" style={stagger("0.12s")}>
          <rect x="220" y="260" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="291" textAnchor="middle">START SCAN</text>
          <text className="flow-sub" x="450" y="310" textAnchor="middle">POST /scan/start</text>
          <text className="flow-tab-tag" x="700" y="310" textAnchor="start">↳ Dashboard tab</text>
          <circle className="flow-node-glow" cx="240" cy="297" r="4" />
        </g>

        <g className="flow-node" style={stagger("0.18s")}>
          <rect x="220" y="380" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="411" textAnchor="middle">CLASSIFY CONTENT</text>
          <text className="flow-sub" x="450" y="430" textAnchor="middle">sensitive vs. non-sensitive</text>
          <text className="flow-tab-tag" x="700" y="430" textAnchor="start">↳ Files tab</text>
          <circle className="flow-node-glow" cx="240" cy="417" r="4" />
        </g>

        <g className="flow-classify-split" style={stagger("0.21s")}>
          <circle className="flow-dot-mini flow-dot-mini--risky" cx="395" cy="478" r="5" />
          <text className="flow-split-label flow-split-label--risky" x="406" y="482" textAnchor="start">
            RISKY
          </text>
          <circle className="flow-dot-mini flow-dot-mini--safe" cx="470" cy="478" r="5" />
          <text className="flow-split-label flow-split-label--safe" x="481" y="482" textAnchor="start">
            SAFE
          </text>
        </g>

        <g className="flow-node" style={stagger("0.24s")}>
          <rect x="220" y="500" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="531" textAnchor="middle">CHECK EXPOSURE</text>
          <text className="flow-sub" x="450" y="550" textAnchor="middle">public, or shared with "everyone"</text>
          <text className="flow-tab-tag" x="700" y="550" textAnchor="start">↳ Files tab</text>
          <circle className="flow-node-glow" cx="240" cy="537" r="4" />
        </g>

        <g className="flow-node" style={stagger("0.30s")}>
          <rect x="220" y="620" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="651" textAnchor="middle">RISK EVALUATION</text>
          <text className="flow-sub" x="450" y="670" textAnchor="middle">clear open alerts, then re-evaluate</text>
          <text className="flow-tab-tag" x="700" y="670" textAnchor="start">↳ Risks tab</text>
          <circle className="flow-node-glow" cx="240" cy="657" r="4" />
        </g>

        <g className="flow-chip flow-chip--high" style={stagger("0.36s")}>
          <rect x="40" y="760" width="220" height="60" rx="30" />
          <text className="flow-label" x="150" y="784" textAnchor="middle">HIGH</text>
          <text className="flow-sub" x="150" y="802" textAnchor="middle">sensitive + exposed</text>
          <circle className="flow-node-glow" cx="64" cy="790" r="4" />
        </g>

        <g className="flow-chip flow-chip--low" style={stagger("0.40s")}>
          <rect x="340" y="760" width="220" height="60" rx="30" />
          <text className="flow-label" x="450" y="784" textAnchor="middle">LOW</text>
          <text className="flow-sub" x="450" y="802" textAnchor="middle">non-sensitive + public</text>
          <circle className="flow-node-glow" cx="364" cy="790" r="4" />
        </g>

        <g className="flow-chip flow-chip--safe" style={stagger("0.44s")}>
          <rect x="640" y="760" width="220" height="60" rx="30" />
          <text className="flow-label" x="750" y="784" textAnchor="middle">SAFE</text>
          <text className="flow-sub" x="750" y="802" textAnchor="middle">sensitive + private</text>
          <circle className="flow-node-glow" cx="664" cy="790" r="4" />
        </g>

        <g className="flow-node flow-node--endpoint" style={stagger("0.52s")}>
          <rect x="220" y="880" width="460" height="84" rx="10" />
          <text className="flow-label" x="450" y="915" textAnchor="middle">DASHBOARD UPDATE</text>
          <text className="flow-sub" x="450" y="937" textAnchor="middle">live: files · sensitive · exposure · alerts</text>
          <text className="flow-tab-tag" x="700" y="937" textAnchor="start">↳ Dashboard tab</text>
          <circle className="flow-node-glow" cx="240" cy="922" r="4" />
        </g>
      </svg>
    </div>
  );
}

const TEST_AUTOMATION_LINES: FlowLine[] = [
  { d: "M190,90 L190,140", begin: 0.0 },
  { d: "M190,210 L190,260", begin: 0.2 },
  { d: "M710,90 L710,140", begin: 0.0 },
  { d: "M710,210 L710,260", begin: 0.2 },
  { d: "M190,330 C190,372 450,372 450,400", begin: 0.4 },
  { d: "M710,330 C710,372 450,372 450,400", begin: 0.4 },
  { d: "M450,474 L450,520", begin: 0.6 },
  { d: "M450,590 L450,640", begin: 0.8 },
  { d: "M450,710 L450,760", begin: 1.0 },
];

export function TestAutomationFlow({ revealed }: FlowProps) {
  return (
    <div className="flow-diagram-wrap">
      <svg
        viewBox="0 0 900 900"
        role="img"
        className={revealed ? "in-view" : ""}
        aria-label="Test automation layers: API tests through clients to FastAPI, and UI tests through page objects to Playwright and React, both converging on the live Docker Compose stack, then Allure results, then CI on GitHub Actions, then a published report."
      >
        <FlowLines lines={TEST_AUTOMATION_LINES} revealed={revealed} />

        <g className="flow-node flow-node--endpoint" style={stagger("0.00s")}>
          <rect x="30" y="20" width="320" height="70" rx="10" />
          <text className="flow-label" x="190" y="49" textAnchor="middle">API TESTS</text>
          <text className="flow-sub" x="190" y="68" textAnchor="middle">pytest -m api</text>
          <circle className="flow-node-glow" cx="50" cy="55" r="4" />
        </g>
        <g className="flow-node flow-node--endpoint" style={stagger("0.00s")}>
          <rect x="550" y="20" width="320" height="70" rx="10" />
          <text className="flow-label" x="710" y="49" textAnchor="middle">UI TESTS</text>
          <text className="flow-sub" x="710" y="68" textAnchor="middle">pytest -m ui</text>
          <circle className="flow-node-glow" cx="570" cy="55" r="4" />
        </g>

        <g className="flow-node" style={stagger("0.08s")}>
          <rect x="30" y="140" width="320" height="70" rx="10" />
          <text className="flow-label" x="190" y="169" textAnchor="middle">CLIENTS</text>
          <text className="flow-sub" x="190" y="188" textAnchor="middle">auth · files · scan · risks · dashboard</text>
          <circle className="flow-node-glow" cx="50" cy="175" r="4" />
        </g>
        <g className="flow-node" style={stagger("0.08s")}>
          <rect x="550" y="140" width="320" height="70" rx="10" />
          <text className="flow-label" x="710" y="169" textAnchor="middle">PAGE OBJECTS</text>
          <text className="flow-sub" x="710" y="188" textAnchor="middle">login · dashboard · files · risks</text>
          <circle className="flow-node-glow" cx="570" cy="175" r="4" />
        </g>

        <g className="flow-node" style={stagger("0.16s")}>
          <rect x="30" y="260" width="320" height="70" rx="10" />
          <text className="flow-label" x="190" y="289" textAnchor="middle">REQUESTS → FASTAPI</text>
          <text className="flow-sub" x="190" y="308" textAnchor="middle">direct HTTP calls</text>
          <circle className="flow-node-glow" cx="50" cy="295" r="4" />
        </g>
        <g className="flow-node" style={stagger("0.16s")}>
          <rect x="550" y="260" width="320" height="70" rx="10" />
          <text className="flow-label" x="710" y="289" textAnchor="middle">PLAYWRIGHT → REACT</text>
          <text className="flow-sub" x="710" y="308" textAnchor="middle">browser-driven journeys</text>
          <circle className="flow-node-glow" cx="570" cy="295" r="4" />
        </g>

        <g className="flow-node flow-node--endpoint" style={stagger("0.28s")}>
          <rect x="220" y="400" width="460" height="74" rx="10" />
          <text className="flow-label" x="450" y="431" textAnchor="middle">LIVE STACK</text>
          <text className="flow-sub" x="450" y="450" textAnchor="middle">docker compose: postgres + fastapi + react</text>
          <circle className="flow-node-glow" cx="240" cy="437" r="4" />
        </g>

        <g className="flow-node" style={stagger("0.34s")}>
          <rect x="220" y="520" width="460" height="70" rx="10" />
          <text className="flow-label" x="450" y="549" textAnchor="middle">ALLURE RESULTS</text>
          <text className="flow-sub" x="450" y="568" textAnchor="middle">nested @allure.step per action</text>
          <circle className="flow-node-glow" cx="240" cy="555" r="4" />
        </g>

        <g className="flow-node" style={stagger("0.40s")}>
          <rect x="220" y="640" width="460" height="70" rx="10" />
          <text className="flow-label" x="450" y="669" textAnchor="middle">CI: GITHUB ACTIONS</text>
          <text className="flow-sub" x="450" y="688" textAnchor="middle">build → health check → smoke tests</text>
          <circle className="flow-node-glow" cx="240" cy="675" r="4" />
        </g>

        <g className="flow-node flow-node--endpoint" style={stagger("0.48s")}>
          <rect x="220" y="760" width="460" height="84" rx="10" />
          <text className="flow-label" x="450" y="795" textAnchor="middle">REPORT PUBLISHED</text>
          <text className="flow-sub" x="450" y="817" textAnchor="middle">github pages + job summary link</text>
          <circle className="flow-node-glow" cx="240" cy="802" r="4" />
        </g>
      </svg>
    </div>
  );
}
