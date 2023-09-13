import { Body, Controller, Get, Logger, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ProtocolWithStepsDTO } from 'sharedlib/dto/protocol.dto';

@Controller()
export class AppController {

    private readonly logger = new Logger(AppController.name);

    constructor(
        private readonly appService: AppService,
    ) { }

    @Get("protocols")
    getProtocols() {
        this.logger.log("Retrieving all protocols")
        return this.appService.getProtocols();
    }

    @Get("protocol/:id")
    getProtocolSteps(@Param('id', new ParseIntPipe()) id: number) {
        this.logger.log(`Retrieving protocol ${id}`)
        return this.appService.getProtocolSteps(id);
    }

    @Get("liquids")
    getPermanentLiquids() {
        this.logger.log("Retrieving all liquids");
        return this.appService.getPermanentLiquids();
    }

    @Get("types")
    getLiquidTypes() {
        this.logger.log("Retrieving all liquid types");
        return this.appService.getLiquidTypes();
    }

    @Get("/protocol/:id/custom-liquids")
    getCustomProtocolLiquids(@Param('id', new ParseIntPipe()) id: number) {
        this.logger.log(`Retrieving custom liquids for protocol ${id}`);
        return this.appService.getCustomProtocolLiquids(id);
    }

    @Post("/protocol/save")
    async saveProtocol(@Body() protocol: ProtocolWithStepsDTO) {
        this.logger.log(`Saving protocol: ${protocol}`)
        await this.appService.saveProtocol(protocol);
    }

}
