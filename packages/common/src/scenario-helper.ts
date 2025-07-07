import { CompilerConfiguration } from "@bitauth/libauth";


// TODO 
// 
// Generate lists of scenarios for testing from templates
// 
export function generateSerializedScenario(compilerConfiguration: CompilerConfiguration) {
    
    let tests : any[] = []
    for(var script in compilerConfiguration.scripts){
        console.log(script)
        
    }
    return tests
}