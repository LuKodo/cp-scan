import { http } from "./http";

export const getSvgString = (paths: string[]) => {
    const width = 800;
    const height = 300;

    return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}"
     height="${height}"
     viewBox="0 0 ${width} ${height}">
  ${paths
            .map(
                d => `
    <path
      d="${d}"
      stroke="black"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />`
            )
            .join('')}
</svg>
`.trim();
};

export const signatureService = async (ssc: string, svgFirma: string): Promise<{ saved: boolean }> => {
    try {
        return http
            .patch(`documentos/${ssc}`, {
                json: {
                    svgFirma
                },
            })
            .json<{ saved: boolean }>();
    } catch (error) {
        return { saved: false };
    }
};