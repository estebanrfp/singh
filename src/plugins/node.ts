import { Minister } from "minister";
import { StoreObject } from 'store_object';
import { cmd, cmdCon } from 'utils';
import { which, exec, ls } from "shelljs";

import { join } from "path";
import { readJsonSync } from "fs-extra";

export class Node extends Minister
{
    private static instance: Node;
    private constructor () { super(); }
    static getInstance ()
    {
        if ( !this.exist() ) return;
        if ( !Node.instance ) Node.instance = new Node();
        return Node.instance;
    }

    static exist (): boolean
    {
        return !!which( `npm` );
    }

    dependancies: Minister[] = [];

    getName () { return "Node" }

    async install ( objs: StoreObject[] ): Promise<string | undefined>
    {
        let installList: string = '';
        await Promise.all( objs.map( obj => installList += `${ obj.id } ` ) );
        if ( installList )
            return cmdCon( `npm install -g ${ installList } ` );
    }

    async uninstall ( objs: StoreObject[] ): Promise<string | undefined>
    {
        let uninstallList: string = '';
        await Promise.all( objs.map( obj => uninstallList += `${ obj.id } ` ) );
        if ( uninstallList )
            return cmdCon( `npm remove -g ${ uninstallList } ` );
    }

    async version (): Promise<string>
    {
        return cmd( `npm --version` );
    }

    async listLocalObjects (): Promise<StoreObject[]>
    {
        const rootPath = ( await cmd( `npm root -g` ) ).trim();
        const packageList = ls( rootPath );
        const objs: StoreObject[] = [];
        packageList
            .map(
                packageName =>
                {
                    const packageJson = readJsonSync(
                        join(
                            rootPath,
                            packageName,
                            'package.json'
                        )
                    );
                    if ( packageJson._id )
                        objs.push(
                            {
                                id: packageName,
                                version: packageJson.version
                            } as StoreObject
                        );
                }
            );
        return objs;
    }

    // async listLocalObjects (): Promise<StoreObject[]>
    // {
    //     const list = '';//await this.list()

    //     const lines = list
    //         .split( '\n' )
    //         .filter( element => element.indexOf( '──' ) + 1 && element.indexOf( '->' ) == -1 );
    //     lines.forEach(
    //         ( value, index, array ) =>
    //         {
    //             array[ index ] = value.substr( 4 );
    //         }
    //     );
    //     return Array.from(
    //         lines,
    //         line =>
    //         {
    //             const objs = line.split( '@' );
    //             return { id: objs[ 0 ], version: objs[ 1 ] } as StoreObject;
    //         } );
    // }
}