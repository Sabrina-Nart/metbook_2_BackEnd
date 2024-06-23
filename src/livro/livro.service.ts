/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { LivroEntity } from './livro.entity';
import { AutorEntity } from '../autor/autor.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LivroDto } from './livro.dto';

@Injectable()
export class LivrosService {
    constructor(
        @InjectRepository(LivroEntity)
        private livroRepository: Repository<LivroEntity>,
        @InjectRepository(AutorEntity)
        private autorRepository: Repository<AutorEntity>,
    ) {}

    async findAll() {
        return this.livroRepository.find({ relations: ['autores'] });
    }

    async findById(id: string): Promise<LivroEntity> {
        const findOne = await this.livroRepository.findOne({
            where: { id },
            relations: ['autores'],
        });

        if (!findOne) {
            throw new NotFoundException('Livro não encontrado. Código: ' + id);
        }

        return findOne;
    }

    async remove(id: string) {
        const livroToRemove = await this.findById(id);
        return this.livroRepository.remove(livroToRemove);
    }

    async create(dto: LivroDto) {
        if (dto.titulo && dto.titulo.length > 100) {
            throw new BadRequestException('O título deve possuir no máximo 100 caracteres.');
        }

        if (!dto.titulo || !dto.isbn) {
            throw new BadRequestException('O título e o ISBN do livro devem ser informados.');
        }

        this.validateLivro(dto);

        let autor = await this.autorRepository.findOne({ where: { nome: dto.autor.nome } });

        if (!autor) {
            autor = this.autorRepository.create(dto.autor);
            await this.autorRepository.save(autor);
        }

        const novoLivro = this.livroRepository.create({ ...dto, autores: [autor] });

        return this.livroRepository.save(novoLivro);
    }

    async update(livro: LivroDto) {
        await this.findById(livro.id);

        this.validateLivro(livro);

        let autor = await this.autorRepository.findOne({ where: { nome: livro.autor.nome } });

        if (!autor) {
            autor = this.autorRepository.create(livro.autor);
            await this.autorRepository.save(autor);
        }

        return this.livroRepository.save({ ...livro, autores: [autor] });
    }

    async searchByName(nome: string): Promise<LivroEntity[]> {
        return this.livroRepository.find({ where: { titulo: Like(`%${nome}%`) } });
    }

    private validateLivro(livro: LivroDto) {
        this.validateNumeroPaginas(livro.numeroPaginas);
        this.validateAnoLancamento(livro.anoLancamento);
        this.validatePreco(livro.preco);
        this.validateLogoUrl(livro.logoUrl);
    }

    private validateNumeroPaginas(numeroPaginas: number) {
        if (!Number.isInteger(numeroPaginas) || numeroPaginas <= 0) {
            throw new BadRequestException('O número de páginas deve conter apenas números positivos.');
        }
    }

    private validateAnoLancamento(ano: number) {
        if (!Number.isInteger(ano)) {
            throw new BadRequestException('O ano de lançamento deve conter apenas números inteiros.');
        }
    }

    private validatePreco(preco: number) {
        if (!Number.isInteger(preco)) {
            throw new BadRequestException('O preço deve ser um número inteiro.');
        }
    }

    private validateLogoUrl(logoUrl: string) {
        if (logoUrl && !logoUrl.startsWith('https://')) {
            throw new BadRequestException('A URL do logo deve estar no formato correto (começar com "https://").');
        }
    }
}
