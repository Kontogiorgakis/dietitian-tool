import { ReactNode } from "react";

export interface BasePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export interface BaseLayoutProps extends BasePageProps {
  children?: ReactNode;
}

export interface ClientPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export interface ClientLayoutProps extends ClientPageProps {
  children?: ReactNode;
}
