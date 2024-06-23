/* eslint-disable prettier/prettier */
import { Controller, Get, Query, Param, Body, Post, Put, Delete } from '@nestjs/common';
import { LivrosService } from './livro.service';
import { LivroDto } from './livro.dto';
import { LivroEntity } from './livro.entity';

@Controller('livros')
export class LivroController {
  constructor(private livroService: LivrosService) {}

  @Get('search')
  async searchByTitle(@Query('q') query: string): Promise<LivroEntity[]> {
    return this.livroService.searchByName(query);
  }

  @Get()
  async findAll(): Promise<LivroEntity[]> {
    return this.livroService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ id: string }> {
    return this.livroService.remove(id);
  }

  @Post()
  async create(@Body() dto: LivroDto): Promise<LivroEntity> {
    return this.livroService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: LivroDto): Promise<LivroEntity> {
    return this.livroService.update({ id, ...dto });
  }
}
