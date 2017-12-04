import * as d3 from 'd3';

class StateSingleton
{
    cursor: any = null;
    dragline: any = null;
    createModeEnabled: boolean = false;
    pushMouseTimer: any = null;
    pushMouseTimerTolerance: number = 150; // the create mode node push mouse timer length

    currentlyDragging: boolean = false;

    dragEnabled: boolean = false;
    dragPos: [number, number] = [null, null];
    dragStartPos:  any
    dragEndPos: any

    // we save exact event handlers functions
    // to attach them and dettach them upon request
    savedHandlers: any = {
        touchStartDrag: null,
        mouseDownDrag: null,
    }

    savedNode: any = null;
}

export let State = new StateSingleton()
