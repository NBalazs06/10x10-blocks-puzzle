//filling main grid and shape options with square slots
fillWithSquareSlots(document.getElementById("grid"), 100);

document.querySelectorAll("#shapeSelector .shapeOption").forEach((shapeOption) => {
    fillWithSquareSlots(shapeOption, 16);
});

//HTML ELEMENTS
const grid = document.getElementById("grid");
const scoreNum = document.getElementById("scoreNum");
const playAgainButton = document.getElementById("playAgainButton");

//OTHER GLOBAL DECLARATIONS
let selectedShapeOption = null;
const highlightedGridSlotPositions = []; //highlights show where the given shape would be placed when the player hovers over a valid grid slot
const mainGridSlots = [];
const shapeOptions = Array.from(document.querySelectorAll("#shapeSelector .shapeOption"));
const shapeOptionSlotGrids = [];
const shapeColors = ["yellow", "blue", "red", "green", "orange","hotpink", "purple", "brown"];
const slotGridsByShapeOption = new Map();
const directionArrsByColor = new Map([
    ["yellow", ["right", "down", "left"]],
    ["blue", ["down", "down", "down"]],
    ["red", ["right", "left", "down", "left"]],
    ["green", ["left", "right", "down", "right"]],
    ["orange", ["down", "down", "right"]],
    ["hotpink", ["down", "down", "left"]],
    ["purple", ["left", "right", "right", "left", "down"]],
    ["brown", []]
]);

//MAIN LOGIC
for (let i = 0; i < 10; i++) {
    const row = [];

    for (let j = 0; j < 10; j++)
        row.push(grid.children[i * 10 + j]);

    mainGridSlots.push(row);
}

shapeOptions.forEach(shapeOption => {
    const slotGrid = [];

    for (let i = 0; i < 4; i++) {
        const row = [];

        for (let j = 0; j < 4; j++)
            row.push(shapeOption.children[i * 4 + j]);

        slotGrid.push(row);
    }

    shapeOptionSlotGrids.push(slotGrid);
    slotGridsByShapeOption.set(shapeOption, slotGrid);
});

for (let r = 0; r < 10; r++)
    for (let c = 0; c < 10; c++)
        mainGridSlots[r][c].style.backgroundColor = "rgb(70, 70, 70)";

for (const slotGrid of shapeOptionSlotGrids) {
    for (let r = 0; r < 4; r++)
        for (let c = 0; c < 4; c++)
            slotGrid[r][c].style.backgroundColor = "rgb(50, 50, 50)";

    const randomColor = shapeColors[Math.floor(Math.random() * shapeColors.length)];
    
    putShapeInGrid(slotGrid, 0, 1, randomColor, directionArrsByColor.get(randomColor));
}

for (const shapeOption of shapeOptions) {
    shapeOption.addEventListener("click", () => {
        if (selectedShapeOption)
            selectedShapeOption.style.border = "none";

        selectedShapeOption = shapeOption;

        selectedShapeOption.style.border = "4px dashed white";
    });
}

playAgainButton.addEventListener("click", playAgain);

for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
        const gridSlot = mainGridSlots[r][c];

        gridSlot.addEventListener("mouseover", () => {
            if (selectedShapeOption && isPossibleToPlace(r, c, directionArrsByColor.get(getColorOfSelectedShapeOption()))) {
                putShapeInGrid(mainGridSlots, r, c, "rgb(150, 150, 150)", directionArrsByColor.get(getColorOfSelectedShapeOption()));
            }
        });

        gridSlot.addEventListener("mouseout", () => {
            if (gridSlot.style.backgroundColor === "rgb(100, 100, 100)") {
                gridSlot.style.backgroundColor = "rgb(70, 70, 70)";
            }
            
            for (const [row, col] of highlightedGridSlotPositions)
                if (mainGridSlots[row][col].style.backgroundColor === "rgb(150, 150, 150)")
                    mainGridSlots[row][col].style.backgroundColor = "rgb(70, 70, 70)";
        
            highlightedGridSlotPositions.length = 0;
        });

        gridSlot.addEventListener("click", () => {
            if (highlightedGridSlotPositions.length) {
                scoreNum.innerHTML = Number(scoreNum.innerHTML) +
                Array.from(selectedShapeOption.children).filter(slot => slot.style.backgroundColor !== "rgb(50, 50, 50)").length;

                const color = getColorOfSelectedShapeOption();

                for (const [r, c] of highlightedGridSlotPositions)
                    mainGridSlots[r][c].style.backgroundColor = color;

                highlightedGridSlotPositions.length = 0;
                
                Array.from(selectedShapeOption.children).forEach(gridSlot => {
                    gridSlot.style.backgroundColor = "rgb(50, 50, 50)";
                });

                const randomColor = shapeColors[Math.floor(Math.random() * shapeColors.length)];

                putShapeInGrid(slotGridsByShapeOption.get(selectedShapeOption), 0, 1, randomColor, directionArrsByColor.get(randomColor));

                selectedShapeOption.style.border = "none";
                selectedShapeOption = null;

                clearFilledRowsAndColumns();
                
                if (!isMainGridPlayable())
                    displayGameOverScreen();
            }
        });
    }
}

//FUNCTIONS
function isMainGridPlayable() {
    for (const slotGrid of shapeOptionSlotGrids) {
        const directionArr = directionArrsByColor.get(slotGrid[0][1].style.backgroundColor);

        for (let startR = 0; startR < 10; startR++)
            for (let startC = 0; startC < 10; startC++)
                if (isPossibleToPlace(startR, startC, directionArr))
                    return true;
    }

    return false;
}

function fillWithSquareSlots(element, squareSlotCount) {
    for (let i = 0; i < squareSlotCount; i++) {
        const squareSlot = document.createElement("div");
        squareSlot.classList.add("squareSlot");
        element.appendChild(squareSlot);
    }
}

function getColorOfSelectedShapeOption() {
    return selectedShapeOption.children[1].style.backgroundColor;
}

function isPossibleToPlace(startR, startC, directionArr) {
    if (mainGridSlots[startR][startC].style.backgroundColor !== "rgb(70, 70, 70)")
        return false;

    let r = startR;
    let c = startC;

    for (const direction of directionArr) {
        [r, c] = getPositionAfterMoving(r, c, direction);
        
        if (r === -1 || r === 10 || c === -1 || c === 10 || mainGridSlots[r][c].style.backgroundColor !== "rgb(70, 70, 70)")
            return false;
    }

    return true;
}

//works with both the main grid and the option grids
function putShapeInGrid(gridRepresentationArr, startR, startC, color, directionArr) {
    gridRepresentationArr[startR][startC].style.backgroundColor = color;

    if (color === "rgb(150, 150, 150)")
        highlightedGridSlotPositions.push([startR, startC]);

    let r = startR;
    let c = startC;

    for (const direction of directionArr) {
        [r, c] = getPositionAfterMoving(r, c, direction);

        gridRepresentationArr[r][c].style.backgroundColor = color;

        if (color === "rgb(150, 150, 150)")
            highlightedGridSlotPositions.push([r, c]);
    }
}

function getPositionAfterMoving(r, c, direction) {
    if (direction === "up")
        r--;
    else if (direction === "down")
        r++;
    else if (direction === "left")
        c--;
    else if (direction === "right")
        c++;
    else
        console.error("Invalid direction!");
    
    return [r, c];
};

//a row and a column can get cleared by the same placement, that's why I don't just clear them before collecting both the row and col indices
function clearFilledRowsAndColumns() {
    const rowsToClear = [];
    const colsToClear = [];

    for (let r = 0; r < 10; r++)
        if (mainGridSlots[r].every((gridSlot) => gridSlot.style.backgroundColor !== "rgb(70, 70, 70)"))
            rowsToClear.push(r);

    for (let c = 0; c < 10; c++)
        if (mainGridSlots.map((row) => row[c]).every((gridSlot) => gridSlot.style.backgroundColor !== "rgb(70, 70, 70)"))
            colsToClear.push(c);

    for (const rowIdx of rowsToClear)
        mainGridSlots[rowIdx].forEach((gridSlot) => gridSlot.style.backgroundColor = "rgb(70, 70, 70)");

    for (const colIdx of colsToClear)
       mainGridSlots.map((row) => row[colIdx]).forEach((gridSlot) => gridSlot.style.backgroundColor = "rgb(70, 70, 70)");
}

function displayGameOverScreen() {
    document.body.style.display = "flex";
    document.body.style.flexDirection = "column";
    document.body.style.justifyContent = "space-evenly";
    grid.style.display = "none";
    document.getElementById("help").style.display = "none";
    document.getElementById("shapeSelector").style.display = "none";
    document.getElementById("gameOverText").style.display = "block";
    document.getElementById("scoreDisplay").style.fontSize = "80px";
    playAgainButton.style.display = "block";
}

function playAgain() {
    for (const row of mainGridSlots)
        for (const gridSlot of row)
            gridSlot.style.backgroundColor = "rgb(70, 70, 70)";

    scoreNum.innerHTML = 0;

    shapeOptions.forEach(shapeOption => {
        Array.from(shapeOption.children).forEach(gridSlot => {
            gridSlot.style.backgroundColor = "rgb(50, 50, 50)";
        });

        const randomColor = shapeColors[Math.floor(Math.random() * shapeColors.length)];
        
        putShapeInGrid(slotGridsByShapeOption.get(shapeOption), 0, 1, randomColor, directionArrsByColor.get(randomColor));
    });

    document.body.style.display = "";
    document.body.style.flexDirection = "";
    document.body.style.justifyContent = "";
    grid.style.display = "";
    document.getElementById("help").style.display = "";
    document.getElementById("shapeSelector").style.display = "";
    document.getElementById("gameOverText").style.display = "";
    document.getElementById("scoreDisplay").style.fontSize = "";
    playAgainButton.style.display = "";
}