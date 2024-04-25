using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace The_Kickers.Models
{
    public class Stock
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }
        public string name { get; set; } = "";
        public double price { get; set; } = 0;
        public long qty { get; set; } = 0;
    }
}