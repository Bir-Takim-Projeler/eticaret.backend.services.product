import { PriceType, Product } from "@libs/entities/src"

export const productStub = (id: "1" | "2") => (id == "1" ? {
    id: "1",
    name: "IPhone X",
    brand: "Apple",
    sku: ["1234", "1235"],
    description: "Apple Iphone x, 64gb",
    specs: {
        display: "Super Retina HD, 5.8-inch (diagonal) all-screen OLED Multi-Touch display, HDR",
        resulation: "2436-by-1125-pixel resolution at 458 ppi, 1,000,000:1 contrast ratio (typical)",
        memory: "8gb",
        chipset: "64 bit mimariye sahip A11 Bionic çip,Nöral sistem,tümleşik M11 yardımcı hareket işlemcisi"
    },
    price: {
        type: PriceType.TRY,
        unit: 6.099,
        task: 10,
    },
    category: "1"
} as Product : {} as Product)



export const ProductService = jest.fn().mockReturnValue({
    GetProductById: jest.fn().mockImplementation(async (id: string): Promise<Product> => {
        if (id != "1") throw new Error("Product not found") // todo: implement product not found error at service
        return new Product(productStub("1"))
    })
})