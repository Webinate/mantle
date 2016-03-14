declare module ModepressAdmin
{
    /*
    * Describes a dashboard link
    */
    export interface IDashLik
    {
        label: string;
        icon: string;
        state: string;
        children?: Array<IDashLik>;
    }

    /*
    * The interface to describe the modepress admin plugins
    */
    export interface IAdminPlugin
    {
        dashboardLinks: Array<IDashLik>;

        /**
        * Called when the application module is being setup
        */
        onInit: (mod: angular.IModule) => void;

        /**
        * Called when the states are being setup in config
        */
        onStatesInit: (stateProvider: angular.ui.IStateProvider) => void;
    }
}