import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Agendamentos')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Criar novo agendamento' })
  @ApiResponse({ status: 201, description: 'Agendamento criado com sucesso' })
  @ApiResponse({ status: 403, description: 'Sem permissão para criar agendamentos' })
  @ApiResponse({ status: 400, description: 'Conflito de horário' })
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.create(createAppointmentDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar agendamentos' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data de início (ISO string)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data de fim (ISO string)' })
  @ApiQuery({ name: 'status', required: false, description: 'Status do agendamento' })
  @ApiQuery({ name: 'clientId', required: false, description: 'ID do cliente' })
  @ApiQuery({ name: 'userId', required: false, description: 'ID do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos obtida com sucesso' })
  findAll(@Request() req, @Query() filters: any) {
    return this.appointmentsService.findAll(req.user, filters);
  }

  @Get('calendar/:month/:year')
  @ApiOperation({ summary: 'Obter dados do calendário para um mês específico' })
  @ApiResponse({ status: 200, description: 'Dados do calendário obtidos com sucesso' })
  getCalendarData(
    @Param('month') month: number,
    @Param('year') year: number,
    @Request() req,
  ) {
    return this.appointmentsService.getCalendarData(req.user, month, year);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Obter estatísticas do dashboard' })
  @ApiQuery({ name: 'month', required: false, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'year', required: false, description: 'Ano' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas com sucesso' })
  getDashboardStats(@Request() req, @Query('month') month?: number, @Query('year') year?: number) {
    return this.appointmentsService.getDashboardStats(req.user, month, year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter agendamento por ID' })
  @ApiResponse({ status: 200, description: 'Agendamento obtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Atualizar agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para atualizar agendamentos' })
  @ApiResponse({ status: 400, description: 'Conflito de horário' })
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto, @Request() req) {
    return this.appointmentsService.update(id, updateAppointmentDto, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Remover agendamento' })
  @ApiResponse({ status: 200, description: 'Agendamento removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para remover agendamentos' })
  remove(@Param('id') id: string, @Request() req) {
    return this.appointmentsService.remove(id, req.user);
  }
}
