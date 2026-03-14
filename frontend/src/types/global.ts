export type PropsWithClassName = {
  className?: string;
};

export type PropsWithChildren = {
  children: React.ReactNode;
};

export type PropsWithChildrenAndClassName = PropsWithClassName &
  PropsWithChildren;
