"use client";

import "./program-print.css";

export interface PrintableExercise {
id: number;
name: string;
sets: number;
reps: string;
weight: number;
rest: number;
}

export interface PrintableWorkout {
id: number;
name: string;
sequenceNumber: number;
exercises: PrintableExercise[];
}

export interface PrintableWeek {
id: number;
sequenceNumber: number;
workouts: PrintableWorkout[];
}

export interface PrintableProgram {
name: string;
description: string;
durationWeeks: number;
status: string;
weeks: PrintableWeek[];
}

interface ProgramPrintViewProps {
program: PrintableProgram;
}

export function ProgramPrintView({
program,
}: ProgramPrintViewProps) {
return (
<div className="program-print-view">
<div className="program-print-document">
{/* Program Header */}
<header className="program-print-header">
<div>
<p className="program-print-label">
WORKOUT PROGRAM
</p>

        <h1 className="program-print-title">
          {program.name}
        </h1>

        {program.description && (
          <p className="program-print-description">
            {program.description}
          </p>
        )}
      </div>

      <div className="program-print-meta">
        <div>
          <span>Duration</span>
          <strong>
            {program.durationWeeks} Weeks
          </strong>
        </div>

        <div>
          <span>Status</span>
          <strong>
            {program.status}
          </strong>
        </div>
      </div>
    </header>

    {/* Program Weeks */}
    {program.weeks.length === 0 ? (
      <p className="program-print-empty">
        No weeks have been configured
        for this program.
      </p>
    ) : (
      program.weeks.map(
        (week, weekIndex) => (
          <section
            key={week.id}
            className={`program-print-week ${
              weekIndex > 0
                ? "print-page-break"
                : ""
            }`}
          >
            <div className="program-print-week-header">
              <h2>
                Week {weekIndex + 1}
              </h2>
            </div>

            {week.workouts.length ===
            0 ? (
              <p className="program-print-empty">
                No workouts have been
                configured for this
                week.
              </p>
            ) : (
              <div className="program-print-workouts">
                {week.workouts.map(
                  (
                    workout,
                    workoutIndex
                  ) => (
                    <section
                      key={
                        workout.id
                      }
                      className="program-print-workout avoid-break"
                    >
                      <div className="program-print-workout-header">
                        <h3>
                          
                          {
                            workout.name
                          }
                        </h3>
                      </div>

                      {workout.exercises
                        .length ===
                      0 ? (
                        <p className="program-print-empty">
                          No exercises
                          have been
                          added to this
                          workout.
                        </p>
                      ) : (
                        <table className="program-print-table">
                          <thead>
                            <tr>
                              <th>
                                Exercise
                              </th>
                              <th>
                                Sets
                              </th>
                              <th>
                                Reps
                              </th>
                              <th>
                                Rest
                              </th>
                              <th>
                                Weight
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {workout.exercises.map(
                              (
                                exercise
                              ) => (
                                <tr
                                  key={
                                    exercise.id
                                  }
                                >
                                  <td className="program-print-exercise-name">
                                    {
                                      exercise.name
                                    }
                                  </td>

                                  <td>
                                    {
                                      exercise.sets
                                    }
                                  </td>

                                  <td>
                                    {
                                      exercise.reps
                                    }
                                  </td>

                                  <td>
                                    {
                                      exercise.rest
                                    }{" "}
                                    sec
                                  </td>

                                  <td>
                                    {
                                      exercise.weight
                                    }{" "}
                                    kg
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      )}
                    </section>
                  )
                )}
              </div>
            )}
          </section>
        )
      )
    )}
  </div>
</div>

);
}