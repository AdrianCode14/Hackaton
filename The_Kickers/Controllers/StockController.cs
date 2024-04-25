using Microsoft.AspNetCore.Mvc;

namespace The_Kickers.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StockController : ControllerBase
    {

        private readonly DBkickers _context;
        public StockController(DBkickers context) { 
            _context = context;
        }

        [HttpDelete(Name = "DeleteFromStock")]
        public async Task<IActionResult> DeleteFromStock([FromBody] int idToDelete)
        {

            var entityToUpdate = _context.stock.FirstOrDefault(e => e.Id == idToDelete);

            if (entityToUpdate != null)
            {
                if (entityToUpdate.qty <= 0)
                    throw new Exception("No more quantity");
                entityToUpdate.qty--;               
                _context.SaveChanges();
                await DecrementQuantityInCSV(idToDelete);
            }
            return Ok();
        }

        [HttpPost(Name = "DeleteFromCsv")]
        public async Task DecrementQuantityInCSV(int idToDelete)
        {
            string filePath = "C:\\Users\\FirenzeMatteo\\Documents\\hackatonKickers\\The_Kickers\\stock.txt";
            string tempFilePath = "C:\\Users\\FirenzeMatteo\\Documents\\hackatonKickers\\The_Kickers\\temp_stock.txt";

            try
            {
                using (StreamReader sr = new StreamReader(filePath))
                using (StreamWriter sw = new StreamWriter(tempFilePath))
                {
                    string line;
                    bool idFound = false;

                    while ((line = sr.ReadLine()) != null)
                    {
                        string[] columns = line.Split(',');

                        // Check if the ID matches the one to delete
                        if (int.TryParse(columns[0], out int id) && id == idToDelete)
                        {
                            if (int.TryParse(columns[3], out int qty) && qty > 0)
                            {
                                qty--;
                                columns[3] = qty.ToString();
                                line = string.Join(",", columns);
                                idFound = true;
                            }
                            else
                            {
                                Console.WriteLine("La quantité pour l'ID spécifié est déjà à zéro ou moins.");
                            }
                        }
                        sw.WriteLine(line);
                    }

                    if (!idFound)
                    {
                        Console.WriteLine("ID spécifié non trouvé dans le fichier.");
                    }
                }

                System.IO.File.Delete(filePath);
                System.IO.File.Move(tempFilePath, filePath);

            }
            catch (Exception e)
            {
                Console.WriteLine("Exception: " + e.Message);
            }
        }

    }
}
