import * as d3 from 'd3';

class MouseSingleton
{
    coords: [number, number] = [null, null];

    clickTolerance: number = 5;
    dblClickTimeout = null;

    node = {
        clickTolerance: 5,
        clickWaitTimeout: null, // a timeout
        isMouseDown: false,
    }
    
    getCoords(eventTarget?: any): [number, number]
    {
        return (eventTarget) ? d3.mouse(eventTarget) : d3.mouse(document.body)
    }
}

export let Mouse = new MouseSingleton()
