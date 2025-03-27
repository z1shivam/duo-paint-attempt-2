"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { IoMdRedo, IoMdUndo } from "react-icons/io";
import { BiReset } from "react-icons/bi";
import { LuEraser } from "react-icons/lu";
import { Slider } from "../ui/slider";
import useDrawingStore from "@/state/useDrawingStore";

export default function Toolbar() {
    const colorSet = [
        "Red",
        "Blue",
        "Black",
        "Cyan",
        "Pink",
        "Green",
        "Violet",
        "white",
    ];
    const {
        setColor,
        selectedColor,
        setBrushSize,
        brushSize,
        isEraserOn,
        toggleEraser,
        clearCanvas,
    } = useDrawingStore();

    return (
        <section className="flex w-full flex-wrap gap-4 px-3 md:flex-nowrap">
            <div className="flex w-full justify-between gap-3 rounded-md border-2 border-slate-500 bg-slate-50 p-2 sm:w-auto sm:justify-start">
                {colorSet.map((color) => (
                    <div
                        onClick={() => setColor(color)}
                        key={color}
                        style={{ backgroundColor: color }}
                        className={`h-8 w-8 cursor-pointer rounded-full border-2 border-slate-50 md:h-6 md:w-6 ${selectedColor == color && "ring-2 ring-slate-500"}`}
                    ></div>
                ))}
            </div>
            <div className="flex w-full items-center py-2 md:w-fit md:py-0">
                <Slider
                    value={[brushSize]}
                    min={1}
                    max={30}
                    step={1}
                    className="w-full md:w-44"
                    onValueChange={(value) => {
                        setBrushSize(value[0] as number);
                    }}
                />
                <div className="w-16 flex items-center justify-center">
                    <div
                        className="ml-3 rounded-full"
                        style={{
                            backgroundColor: `${isEraserOn }`,
                            width: `${brushSize}px`, // Size matches brushSize
                            height: `${brushSize}px`, // Keep it a circle
                        }}
                    ></div>
                </div>
            </div>
            <div className="flex w-full items-center justify-between gap-3 sm:justify-start md:w-auto">
                <Button
                    variant={"outline"}
                    className={`cursor-pointer ${isEraserOn && "bg-slate-900 text-white"}`}
                    onClick={() => {
                        toggleEraser();
                    }}
                >
                    <LuEraser /> erase
                </Button>
                <Button variant={"outline"} className="cursor-pointer">
                    <IoMdUndo /> undo
                </Button>
                <Button variant={"outline"} className="cursor-pointer">
                    <IoMdRedo /> redo
                </Button>
                <Button
                    variant={"outline"}
                    className="cursor-pointer"
                    onClick={clearCanvas}
                >
                    <BiReset /> clear
                </Button>
            </div>
        </section>
    );
}
