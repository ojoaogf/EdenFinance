export interface ColorThemeDefinition {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  preview: {
    background: string;
    primary: string;
  };
}

export const COLOR_THEMES: ColorThemeDefinition[] = [
  {
    id: "nordico-quente",
    name: "Nórdico Quente",
    description: "Claro, minimalista, branco quente e azul-acinzentado.",
    isDark: false,
    preview: { background: "#F2ECE3", primary: "#6E8299" },
  },
  {
    id: "concreto",
    name: "Concreto",
    description: "Claro, cinza neutro com um único destaque em bronze.",
    isDark: false,
    preview: { background: "#E9E9E7", primary: "#B08D57" },
  },
  {
    id: "solar-punk",
    name: "Solar Punk",
    description: "Claro, fundo quente e verde-oliva vívido.",
    isDark: false,
    preview: { background: "#FBF6E9", primary: "#7CB342" },
  },
  {
    id: "papel-creme",
    name: "Papel Creme",
    description: "Claro e quente como papel envelhecido, com tinta terracota.",
    isDark: false,
    preview: { background: "#F7F1E6", primary: "#9C4221" },
  },
  {
    id: "ciano-terminal",
    name: "Ciano Terminal",
    description: "Escuro, mesmo clima 'terminal' de sempre, com destaque ciano.",
    isDark: true,
    preview: { background: "#1F2122", primary: "#45D4E0" },
  },
  {
    id: "azul-aco",
    name: "Azul Aço",
    description: "Escuro, azul corporativo e direto.",
    isDark: true,
    preview: { background: "#161C24", primary: "#4A90D9" },
  },
  {
    id: "marinho-lima",
    name: "Marinho + Lima",
    description: "Escuro, base azul-marinho com destaque em verde-lima elétrico.",
    isDark: true,
    preview: { background: "#12182B", primary: "#C8FF4D" },
  },
  {
    id: "noite-estelar",
    name: "Noite Estelar",
    description: "Escuro e frio, azul-marinho quase preto com destaque prateado gelado.",
    isDark: true,
    preview: { background: "#0A0C14", primary: "#CBD5F5" },
  },
  {
    id: "grafite-prata",
    name: "Grafite Prata",
    description: "Escuro, quase monocromático, destaque prateado. Minimalista e premium.",
    isDark: true,
    preview: { background: "#1A1B1D", primary: "#B8BEC7" },
  },
];

export const DEFAULT_COLOR_THEME_ID = "ciano-terminal";
