import { CompilerConfiguration } from "@bitauth/libauth";

export function generateSerializedSenario(compilerConfiguration: CompilerConfiguration) {
    
    let tests : any[] = []
    for(var script in compilerConfiguration.scripts){
        console.log(script)
        
    }
    return tests
}