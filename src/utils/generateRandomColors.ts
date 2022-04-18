export default function generateRandomColors(colorNum: number, colors: number) {
    if (colors < 1) colors = 1; // defaults to one color - avoid divide by zero
    return Array(colors).fill("").map((_, index) => {
        return "hsl(" + (((360*index+1) / colors) % 360) + ",100%,35%)";
    })

}

