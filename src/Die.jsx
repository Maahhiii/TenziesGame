import React from "react"
import "./Die.css"

export default function Die({ value, isHeld, hold, displayMode }) {
    const styles = {
        backgroundColor: isHeld ? "#59E391" : "white"
    }

    function getSVGFace(val) {
        return (
            <svg viewBox="0 0 100 100" className="die-svg">
                {dieDots[val].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="10" fill="#333" />
                ))}
            </svg>
        )
    }

    const dieDots = {
        1: [[50, 50]],
        2: [[25, 25], [75, 75]],
        3: [[25, 25], [50, 50], [75, 75]],
        4: [[25, 25], [25, 75], [75, 25], [75, 75]],
        5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
        6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
    }

    return (
        <button
            style={styles}
            onClick={hold}
            className="die-button"
            aria-pressed={isHeld}
            aria-label={`Die with value ${value}, ${isHeld ? "held" : "not held"}`}
        >
            {getSVGFace(value)}
        </button>
    )
}
