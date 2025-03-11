export interface MenuItem {
    order: number,
    route: string,
    icon: string,
    title: string,
    submodulos: Item[] | undefined;
};

export interface Item {
    order: number,
    route: string,
    title: string,
    icon: string | undefined,
}