import { Test, TestingModule } from '@nestjs/testing';
import { TextContentService } from '../text-content.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('TextContentService', () => {
  let service: TextContentService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    textContent: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TextContentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TextContentService>(TextContentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create text content', async () => {
      const createTextContentDto = {
        content: 'Test content',
        type: 'article',
        language: 'en',
      };
      const expectedResult = {
        id: 1,
        ...createTextContentDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.textContent.create.mockResolvedValue(expectedResult);

      const result = await service.create(createTextContentDto);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.textContent.create).toHaveBeenCalledWith({
        data: createTextContentDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all text contents', async () => {
      const expectedResult = [
        {
          id: 1,
          content: 'Test content 1',
          type: 'article',
          language: 'en',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          content: 'Test content 2',
          type: 'note',
          language: 'pl',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockPrismaService.textContent.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.textContent.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return text content by id', async () => {
      const id = 1;
      const expectedResult = {
        id,
        content: 'Test content',
        type: 'article',
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.textContent.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne(id);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.textContent.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should return null if text content not found', async () => {
      const id = 999;
      mockPrismaService.textContent.findUnique.mockResolvedValue(null);

      const result = await service.findOne(id);
      expect(result).toBeNull();
      expect(mockPrismaService.textContent.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('update', () => {
    it('should update text content', async () => {
      const id = 1;
      const updateTextContentDto = {
        content: 'Updated content',
        type: 'article',
        language: 'pl',
      };
      const expectedResult = {
        id,
        ...updateTextContentDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.textContent.update.mockResolvedValue(expectedResult);

      const result = await service.update(id, updateTextContentDto);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.textContent.update).toHaveBeenCalledWith({
        where: { id },
        data: updateTextContentDto,
      });
    });
  });

  describe('remove', () => {
    it('should remove text content', async () => {
      const id = 1;
      const expectedResult = {
        id,
        content: 'Test content',
        type: 'article',
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaService.textContent.delete.mockResolvedValue(expectedResult);

      const result = await service.remove(id);
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.textContent.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('detectLanguage', () => {
    it('should detect language from text', async () => {
      const text = 'This is a test text in English';
      const result = await service.detectLanguage(text);
      expect(result).toBe('en');
    });

    it('should return default language for empty text', async () => {
      const text = '';
      const result = await service.detectLanguage(text);
      expect(result).toBe('en');
    });
  });
}); 