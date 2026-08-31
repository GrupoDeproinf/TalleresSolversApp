#!/usr/bin/env python3
"""
patch_elf_16kb.py

Parchea el campo p_align de los segmentos PT_LOAD en archivos .so
de 32 y 64 bits para cumplir el requisito de 16 KB de Google Play / Android 15.

Solo modifica el campo de alineación en el encabezado ELF; no mueve datos.

Uso:
    python3 patch_elf_16kb.py <archivo.so> [archivo2.so ...]
    python3 patch_elf_16kb.py <directorio>   # parcha todos los .so del árbol
"""

import struct
import sys
import os

TARGET_ALIGN = 0x4000   # 16 KB
PT_LOAD      = 1        # tipo de segmento a parchear


def patch_elf(path: str) -> bool:
    with open(path, 'rb') as f:
        data = bytearray(f.read())

    # Verificar magia ELF
    if data[:4] != b'\x7fELF':
        return False

    ei_class = data[4]   # 1 = 32-bit, 2 = 64-bit
    ei_data  = data[5]   # 1 = little-endian, 2 = big-endian
    endian   = '<' if ei_data == 1 else '>'

    if ei_class == 2:   # ELF 64-bit
        e_phoff     = struct.unpack_from(f'{endian}Q', data, 32)[0]
        e_phentsize = struct.unpack_from(f'{endian}H', data, 54)[0]
        e_phnum     = struct.unpack_from(f'{endian}H', data, 56)[0]
        align_off   = 48        # offset de p_align dentro del phdr de 64-bit
        fmt         = f'{endian}Q'
    else:               # ELF 32-bit
        e_phoff     = struct.unpack_from(f'{endian}I', data, 28)[0]
        e_phentsize = struct.unpack_from(f'{endian}H', data, 42)[0]
        e_phnum     = struct.unpack_from(f'{endian}H', data, 44)[0]
        align_off   = 28        # offset de p_align dentro del phdr de 32-bit
        fmt         = f'{endian}I'

    modified = False
    for i in range(e_phnum):
        base   = e_phoff + i * e_phentsize
        p_type = struct.unpack_from(f'{endian}I', data, base)[0]

        if p_type == PT_LOAD:
            off     = base + align_off
            p_align = struct.unpack_from(fmt, data, off)[0]
            if p_align < TARGET_ALIGN:
                struct.pack_into(fmt, data, off, TARGET_ALIGN)
                modified = True

    if modified:
        with open(path, 'wb') as f:
            f.write(data)
        print(f'  [16kb-patch] {os.path.basename(path)}  p_align → 0x{TARGET_ALIGN:x}')

    return modified


def main():
    if len(sys.argv) < 2:
        print(f'Uso: {sys.argv[0]} <archivo.so | directorio> ...')
        sys.exit(1)

    patched = 0
    for arg in sys.argv[1:]:
        if os.path.isdir(arg):
            for root, _, files in os.walk(arg):
                for fname in files:
                    if fname.endswith('.so'):
                        if patch_elf(os.path.join(root, fname)):
                            patched += 1
        elif os.path.isfile(arg):
            if patch_elf(arg):
                patched += 1

    print(f'  [16kb-patch] {patched} archivo(s) parcheado(s).')


if __name__ == '__main__':
    main()
