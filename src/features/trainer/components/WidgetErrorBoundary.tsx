"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  widgetId: string;
}

interface State {
  hasError: boolean;
}

export default class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error) {
    console.error(`Widget [${this.props.widgetId}] crashed:`, error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center text-destructive">
          <p className="text-sm font-semibold">Failed to load widget.</p>
          <p className="text-xs opacity-75">Please check configuration layout payload.</p>
        </div>
      );
    }
    return this.props.children;
  }
}